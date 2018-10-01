#!/usr/bin/env bash

export NER_TRAIN_PATH=data/ner_dataset/train.bilou
export NER_VAL_PATH=data/ner_dataset/dev.bilou
export OUTPUT=models/ner

allennlp train experiment/training_configs/ner_elmo.jsonnet -s $OUTPUT --include-package experiment
