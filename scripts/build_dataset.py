import argparse
import itertools
import os
import random

from tqdm import tqdm

DEV_SPLIT = TEST_SPLIT = 0.01

argparser = argparse.ArgumentParser()
argparser.add_argument(
    "-i",
    "--input",
    help="Input file containing annotated text",
    type=str,
    default="data/atc_ner.bilou")
argparser.add_argument(
    "-o",
    "--output_dir",
    help="Output directory for split dataset",
    type=str,
    default="data/ner_dataset/")


def _is_divider(line):
    is_empty = line.strip() == ""
    if not is_empty:
        tokens = line.split()
        if tokens[0] != "-DOCSTART-":
            return False

    return True


def print_sentences_to_file(sentences, output_file_path):
    with open(output_file_path, "w") as output_file:
        for sentence in sentences:
            output_file.write("-DOCSTART- O\n\n")
            output_file.writelines(sentence)
            output_file.write("\n")


if __name__ == "__main__":
    args = argparser.parse_args()
    input_path = args.input
    output_dir_path = args.output_dir

    sentences = []
    with open(input_path) as input_file:
        for is_divider, lines in itertools.groupby(input_file, _is_divider):
            if not is_divider:
                sentences.append(list(lines))

    random.seed(230)
    random.shuffle(sentences)

    dev_count = int(len(sentences) * DEV_SPLIT)
    test_count = int(len(sentences) * TEST_SPLIT)

    train = sentences[:len(sentences) - dev_count - test_count]
    dev = sentences[len(sentences) - dev_count - test_count:len(sentences) -
                    test_count]
    test = sentences[len(sentences) - test_count:len(sentences)]

    if not os.path.exists(output_dir_path):
        os.mkdir(output_dir_path)

    print_sentences_to_file(train, os.path.join(output_dir_path,
                                                "train.bilou"))
    print_sentences_to_file(dev, os.path.join(output_dir_path, "dev.bilou"))
    print_sentences_to_file(test, os.path.join(output_dir_path, "test.bilou"))

    print(f"Training set size: {len(train)}")
    print(f"Dev set size: {len(dev)}")
    print(f"Test set size: {len(test)}")
