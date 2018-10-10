#!/usr/bin/env python
import logging
logging.basicConfig(level=logging.INFO)

from server import app

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    logging.info("Serving server at port 5000")
    server.serve_forever()