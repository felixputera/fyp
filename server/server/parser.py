from lark import Lark


class Parser:
    def __init__(self, grammar='./grammar.lark', **options):
        with open(grammar) as grammarfile:
            self.parser = Lark(grammarfile.read(), **options)

    def parse(self, text):
        return self.parser.parse(text)

    def lex(self, text):
        return self.parser.lex(text)


if __name__ == '__main__':
    """For testing purposes, use call this script with -h for more info"""
    import argparse
    import os
    from lark.tree import pydot__tree_to_png

    __location__ = os.path.realpath(
        os.path.join(os.getcwd(), os.path.dirname(__file__)))

    argparser = argparse.ArgumentParser()
    argparser.add_argument('text', type=str)
    argparser.add_argument('output_filename', type=str)
    args = argparser.parse_args()

    parser = Parser(
        os.path.join(__location__, 'grammar.lark'),
        parser='earley',
        # lexer='contextual',
        propagate_positions=True)
    tree = parser.parse(args.text)

    for inst in tree.iter_subtrees():
        if inst.data in [
                "callsign", "wx_wind_phrase", "after_the_landing_ctl_phrase",
                "airport_runway", "ctl_phrase", "luaw_suffix", "cft_phrase",
                "luaw_phrase", "hold_short_phrase", "cross_phrase",
                "continue_approach_phrase", "departure_freq", "approach_freq",
                "tower_freq", "toc_instruction", "taxi_instruction"
        ]:
            print(inst.data, inst.meta.column, inst.meta.end_column)

    pydot__tree_to_png(tree, args.output_filename)
