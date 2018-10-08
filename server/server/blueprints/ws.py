import json
from flask import Blueprint

from server.segment_text import segment_flight_number, segment_text

ws = Blueprint(r'ws', __name__)


@ws.route('/')
def segment(socket):
    while not socket.closed:
        message = socket.receive()
        print(message)
        socket.send(json.dumps(segment_text(message)))
