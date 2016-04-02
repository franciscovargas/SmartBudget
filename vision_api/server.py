# Computer Vision API
#
# Copyright:  (c) Daniel Duma 2015
# Author: Daniel Duma <danielduma@gmail.com>

# For license information, see LICENSE.TXT

"""
Demo usage:

curl -H "Content-Type: application/json" -H "Accept: application/json" -X POST -d "{\"plain_text\":\"method result experiment __CIT__ trial error process\"}" http://localhost:8090/api/search/
"""

from __future__ import print_function
from flask import Flask, jsonify, Blueprint, request, Response
import logging, json, sys

from api_functions import extract_text, process_ocr_text

ocr_bp = Blueprint("ocr", __name__, url_prefix="/ocr")
static_bp=Blueprint("files",__name__, static_folder="static")

##@static_bp.route('/')
##def root():
##    return static_bp.send_static_file('index.html')
##
##@static_bp.route('/<path:path>')
##def send_file():
##    return static_bp.send_static_file(path)


@ocr_bp.route("/read/", methods=["POST"])
def api_search():
    """
        OCR API entry point.
    """
    print(request)
    print(request.files)
    f = request.files["file"]
    file_content=f.read()

    try:
        data=process_ocr_text(extract_text(file_content))
        resp=jsonify(data=data)
        resp.status_code=200 # all good
    except Exception as e:
        resp=jsonify(error="Runtime error: "+str(sys.exc_info()[:2]))
        resp.status_code=500 # server error
        return resp
    return resp

def startStandaloneServer(host="0.0.0.0", port=5000):
    """
        Starts a basic server with the blueprint
    """
    app = Flask(__name__)
    app.register_blueprint(ocr_bp, url_prefix="/ocr")
##    app.register_blueprint(static_bp, url_prefix="/")


    print("Running main OCR API on %s:%d" % (host,port))
    app.logger.addHandler(logging.StreamHandler(sys.stdout))
##    app.logger.setLevel(logging.)
    app.run(host=host, port=port, debug=True, threaded=True)


def main():
    startStandaloneServer()
    pass

if __name__ == '__main__':
    main()
