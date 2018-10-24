#!/usr/bin/env python3

import argparse
import os
import random

from yaspin import yaspin
from tqdm import tqdm
from lark import Lark
from allennlp.data.tokenizers.word_splitter import SpacyWordSplitter

_tokenizer = SpacyWordSplitter()

random.seed(10)

ENTITIES = {
    "callsign": "CALL",
    "airport_runway": "RWY",
    "wx_wind_speed": "WS",
    "ground_freq": "FREQ",
    "departure_freq": "FREQ",
    "tower_freq": "FREQ",
    "approach_freq": "FREQ"
}


def _create_ner_tags(tokens, parse_tree):
    """
    Accept tokens and its parse tree, returning NER tags sequence
    """
    tags = ["O" for _ in range(len(tokens))]

    token_idx = 0

    for inst in parse_tree.iter_subtrees():
        if inst.data in ENTITIES:
            tag_name = ENTITIES[inst.data]
            tag_start = inst.meta.column - 1
            tag_end = inst.meta.end_column - 1

            while tokens[token_idx].idx < tag_start:
                token_idx += 1

            tags[token_idx] = f"B-{tag_name}"

            # TODO: fix this, may cause incorrect tagging
            # tag_end - 1 is used because a parse node ends at a whitespace
            while tokens[token_idx].idx + len(tokens[token_idx]) < tag_end - 1:
                token_idx += 1
                tags[token_idx] = f"I-{tag_name}"

    return tags


def _parse_and_annotate(sentences, grammar_text):
    """
    Accept list of sentence (sentences) and them annotated in
    format of list[list[tuple(token: str, tag1: str, tag2: str)]]
    """
    parser = Lark(
        grammar_text,
        parser="earley",
        lexer="standard",
        propagate_positions=True)

    annotated_sentences = []

    for sentence in tqdm(
            sentences,
            desc="Parsing and creating sentence annotations",
            total=len(sentences)):
        parse_tree = parser.parse(sentence)
        sentence = sentence.lower()
        tokens = _tokenizer.split_words(sentence=sentence)

        ner_tags = _create_ner_tags(tokens, parse_tree)

        annotated_sentences.append(list(zip(tokens, ner_tags)))

    return annotated_sentences


argparser = argparse.ArgumentParser()
argparser.add_argument(
    "-i",
    "--input",
    type=str,
    default="data/sentences-generated-grm-10-million.txt")
argparser.add_argument(
    "-o",
    "--output_dir",
    help="Output directory for split dataset",
    type=str,
    default="data/ner_dataset/")
argparser.add_argument(
    "-g", "--grammar", type=str, default="server/grammar.lark")
argparser.add_argument(
    "--greetings",
    help="File containing greetings",
    type=str,
    default="data/greetings_sample.txt")
argparser.add_argument(
    "--size", help="Dataset size", type=int, default=1000000)

if __name__ == "__main__":
    args = argparser.parse_args()
    input_path = args.input
    output_dir_path = args.output_dir
    grammar_path = args.grammar
    greetings_path = args.greetings
    size = args.size

    # read input sentences from file
    with yaspin(text="Reading input file") as spinner, open(
            input_path) as input_file:
        sentences = input_file.read().splitlines()
        spinner.ok()

    # shuffle and sample sentences
    with yaspin(text="Shuffling sentences") as spinner:
        random.shuffle(sentences)
        sentences = sentences[:size]
        spinner.ok()

    # read grammar file
    with open(grammar_path) as grammar_file:
        grammar_text = grammar_file.read()

    annotated_sentences = _parse_and_annotate(sentences[:1], grammar_text)

    print(annotated_sentences[0])