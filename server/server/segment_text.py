import re
import logging
from allennlp.models.archival import load_archive
from allennlp.predictors.predictor import Predictor
from allennlp.data.tokenizers.word_splitter import SpacyWordSplitter

from server.parser import Parser
import atc_model.dataset_readers.atc_ner

logger = logging.getLogger(__name__)

FLIGHT_NUMBER_RE = r"([A-Z]{3}|[A-Z\d]{2})(?:\s?)(\d{1,4})"

_tokenizer = SpacyWordSplitter()
_model_archive = load_archive("models/ner/model.tar.gz", cuda_device=-1)
_predictor = Predictor.from_archive(_model_archive)


def segment_flight_number(text):
    segments = []
    for match in re.finditer(FLIGHT_NUMBER_RE, text):
        segments.append({
            "position": [match.start(), match.end()],
            "type": "flight_num"
        })

    return segments


def segment_text(text):
    parser = Parser(parser="lalr", propagate_positions=True)
    try:
        parse_tree = parser.parse(text.upper())
        print(parse_tree)
        segments = []

        for inst in parse_tree.iter_subtrees():
            if inst.data in [
                    "callsign", "wx_wind_phrase",
                    "after_the_landing_ctl_phrase", "airport_runway",
                    "ctl_phrase", "luaw_suffix", "cft_phrase", "luaw_phrase",
                    "hold_short_phrase", "cross_phrase",
                    "continue_approach_phrase", "departure_freq",
                    "approach_freq", "tower_freq", "toc_instruction",
                    "taxi_instruction"
            ]:
                segments.append({
                    "position":
                    [inst.meta.column - 1, inst.meta.end_column - 1],
                    "type":
                    inst.data
                })

        print(segments)
        return segments
    except:
        return []
        # pass


def segment_text_neural(text):
    if not text:
        return []

    # hack for bug in the model where at least one token must have len > 2
    has_bug = True
    words = text.split()
    for word in words:
        if len(word) > 2:
            has_bug = False
            break
    if has_bug:
        return []

    text = text.lower()
    prediction = _predictor.predict(sentence=text)
    tokens = _tokenizer.split_words(sentence=text)
    segments = []

    assert len(tokens) == len(
        prediction["words"]
    ), f"Tokenization result is not consistent; tokens: {list(tokens)} words: {prediction['words']}"

    cur_tag_start = 0
    for i, tag in enumerate(prediction["tags"]):
        split_tag = tag.split("-")
        position = split_tag[0]
        if position == "U":
            segments.append({
                "position": [tokens[i].idx, tokens[i].idx + len(tokens[i])],
                "type":
                split_tag[1]
            })
        elif position == "B":
            cur_tag_start = tokens[i].idx
        elif position == "L":
            segments.append({
                "position": [cur_tag_start, tokens[i].idx + len(tokens[i])],
                "type":
                split_tag[1]
            })

    return segments
