#!/usr/bin/env python

from server import app

if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    print("Serving server at port 5000")
    server.serve_forever()