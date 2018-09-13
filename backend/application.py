import json
from flask import Flask, Blueprint
from flask_sockets import Sockets

from segment_text import segment_flight_number, segment_text

ws = Blueprint(r'ws', __name__)


@ws.route('/')
def segment(socket):
    while not socket.closed:
        message = socket.receive()
        print(message)
        socket.send(json.dumps(segment_text(message)))


app = Flask(__name__)
sockets = Sockets(app)

sockets.register_blueprint(ws, url_prefix=r'/')

if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
