# <description>
#
# Copyright:   (c) Daniel Duma 2016
# Author: Daniel Duma <danielduma@gmail.com>

# For license information, see LICENSE.TXT

import requests
import base64

def process_file(filename):
    """
        Loads a single image file and calls extract_text
    """
    image=file(filename,"rb")
    image_content = base64.b64encode(image.read()).decode('UTF-8')
    url = "http://127.0.0.1/ocr/read/"
##    url = "http://koko.inf.ed.ac.uk/ocr/read/"
    files = {'file': image_content}
    r = requests.post(url, json=files)
    print r.text

def main():
    process_file(r"images\ff1.jpg")
    pass

if __name__ == '__main__':
    main()
