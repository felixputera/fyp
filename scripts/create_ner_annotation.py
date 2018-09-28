import argparse
import os
import mmap
from collections import deque
from tqdm import tqdm
from lark import Lark

ENTITIES = {
    "callsign": "CALL",
    "airport_runway": "RWY",
    "wx_wind_speed": "WS",
    "ground_freq": "FREQ",
    "departure_freq": "FREQ",
    "tower_freq": "FREQ",
    "approach_freq": "FREQ"
}


def get_num_lines(file_path):
    fp = open(file_path, "r+")
    buf = mmap.mmap(fp.fileno(), 0)
    lines = 0
    while buf.readline():
        lines += 1
    return lines


if __name__ == "__main__":
    argparser = argparse.ArgumentParser()
    argparser.add_argument(
        "-i",
        "--input",
        type=str,
        default="data/sentences-generated-grm-10-million.txt")
    argparser.add_argument(
        "-o", "--output", type=str, default="data/atc_ner.bilou")
    argparser.add_argument(
        "-g", "--grammar", type=str, default="backend/grammar.lark")

    args = argparser.parse_args()

    with open(args.grammar) as grammarfile:
        grammar = grammarfile.read()
    parser = Lark(
        grammar, parser="earley", lexer="standard", propagate_positions=True)

    print("Reading input file...")
    sentences = []
    with open(args.input) as inputfile:
        for line in tqdm(inputfile, total=get_num_lines(args.input)):
            sentences.append(line.strip())

    print("Annotating sentences...")
    output_lines = []
    for sentence in tqdm(sentences):
        parsed_tree = parser.parse(sentence)
        ner_segments = deque()
        for inst in parsed_tree.iter_subtrees():
            if inst.data in ENTITIES:
                ner_segments.append((inst.data, inst.meta.column - 1,
                                     inst.meta.end_column - 1))

        output_lines.extend(['-DOCSTART- O', ''])

        sentence = sentence.capitalize()
        last_index = 0
        while last_index < len(sentence):
            if ner_segments:
                segment = ner_segments.popleft()

                words = sentence[last_index:segment[1]].split()
                output_lines.extend([f"{word} O" for word in words])

                entity = ENTITIES[segment[0]]
                words = sentence[segment[1]:segment[2]].split()
                if len(words) == 1:
                    output_lines.append(f"{words[0]} U-{entity}")
                else:
                    for i, word in enumerate(words):
                        if i == 0:
                            bil = "B"
                        elif i == len(words) - 1:
                            bil = "L"
                        else:
                            bil = "I"
                        output_lines.append(f"{word} {bil}-{entity}")

                last_index = segment[2]
            else:
                words = sentence[last_index:len(sentence)].split()
                output_lines.extend([f"{word} O" for word in words])

                break

        output_lines.append('')

    print("Writing output file...")
    with open(args.output, 'w') as outputfile:
        for line in tqdm(output_lines):
            outputfile.write(line + "\n")
