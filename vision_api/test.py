# <description>
#
# Copyright:   (c) Daniel Duma 2016
# Author: Daniel Duma <danielduma@gmail.com>

# For license information, see LICENSE.TXT

import requests, json
import base64
import json

def process_file(filename):
    """
        Loads a single image file and calls extract_text
    """
    image=file(filename,"rb")
    image_content = base64.b64encode(image.read()).decode('UTF-8')
    # url = "http://127.0.0.1/ocr/read/"
    url = "http://koko.inf.ed.ac.uk/ocr/read/"
    files = {'file': image_content}
<<<<<<< HEAD
    r = requests.post(url, data=json.dumps(files) )
    print r.text

def main():
    process_file(r"ff1.jpg")
=======
##    print json.dumps(files)
    r = requests.post(url, data=json.dumps(files))
    print r.text

def main():
##    process_file(r"..\..\scans\tesco\IMG_5664.JPG")
    process_file(r"..\..\scans\farmfoods\IMG_5645.JPG")
>>>>>>> 2cb4d406e538e42b02cab6ef5f64fe7e8de98ad2
    pass

if __name__ == '__main__':
    main()
