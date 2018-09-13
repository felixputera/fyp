import re
from parser import Parser

FLIGHT_NUMBER_RE = r'([A-Z]{3}|[A-Z\d]{2})(?:\s?)(\d{1,4})'


def segment_flight_number(text):
    segments = []
    for match in re.finditer(FLIGHT_NUMBER_RE, text):
        segments.append({
            'position': [match.start(), match.end()],
            'type': 'flight_num'
        })

    return segments


def segment_text(text):
    parser = Parser(parser='lalr', propagate_positions=True)
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
                    'position':
                    [inst.meta.column - 1, inst.meta.end_column - 1],
                    'type':
                    inst.data
                })

        print(segments)
        return segments
    except:
        return []
        # pass
