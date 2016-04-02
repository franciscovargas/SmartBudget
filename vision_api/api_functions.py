# <description>
#
# Copyright:   (c) Daniel Duma 2016
# Author: Daniel Duma <danielduma@gmail.com>

# For license information, see LICENSE.TXT
import argparse, base64, httplib2
import re, os, fnmatch, codecs, json

import logging
logging.basicConfig()

from oauth2client.client import _get_application_default_credential_from_file
from apiclient import discovery

CACHE_FILENAME="cached_json.json"
API_DISCOVERY_FILE = 'https://{api}.googleapis.com/$discovery/rest?version={apiVersion}'
http = httplib2.Http()

credentials = _get_application_default_credential_from_file("credentials.json").create_scoped([
'https://www.googleapis.com/auth/cloud-platform'])
credentials.authorize(http)

service = discovery.build('vision', 'v1', http=http, discoveryServiceUrl=API_DISCOVERY_FILE)

from receipt_extractor import OCRReceiptExtractor


def process_ocr_text(extracted_text):
    """
    """
    extractor=OCRReceiptExtractor(extracted_text)
    return extractor.processData()

def extract_text(image_content):
    """
    """
    service_request = service.images().annotate(
      body={
        'requests': [{
          'image': {
            'content': image_content
           },
          'features': [{
            'type': 'TEXT_DETECTION',
            'maxResults': 6,
           }]
         }]
      })

    response = service_request.execute()
    response=response["responses"][0]
    if 'error' in response:
        print("API Error: %s" % (
                response['error']['message']
                if 'message' in response['error']
                else ''))
        return None

    if 'textAnnotations' in response:
        return response['textAnnotations']
    else:
        return []

def listAllFiles(start_dir, file_mask):
    """
        Creates an ALL_FILES list with relative paths from the start_dir
    """
    ALL_FILES=[]

    for dirpath, dirnames, filenames in os.walk(start_dir):
        for filename in filenames:
            if fnmatch.fnmatch(filename,file_mask):
                    fn=os.path.join(dirpath,filename)
##                    fn=fn.replace(start_dir,"")
                    ALL_FILES.append(fn)

    print("Total files:",len(ALL_FILES))
    return ALL_FILES

def process_file(filename):
    """
        Loads a single image file and calls extract_text
    """
    image=file(filename,"rb")
    image_content = base64.b64encode(image.read()).decode('UTF-8')
##    return extract_text(image_content)
    if os.path.exists(CACHE_FILENAME):
        data=json.load(file(CACHE_FILENAME,"r"))
    else:
        data=extract_text(image_content)
        json.dump(data,file(CACHE_FILENAME,"w"))
    return process_ocr_text(data)

def process_all_images(path):
    """
        Recursese subdirectories, processes all files
    """
    all_files=listAllFiles(path,"*.jpg")
    for filename in all_files:
        new_filename=filename+".txt"
        text=process_file(filename)
        if text and len(text) > 0:
            f=codecs.open(new_filename,"w", encoding="utf-8")
##             f=file(new_filename,"w")
            f.write(text[0]["description"])
            f.close()

def main():
    print process_file(r"images\receipt1.jpg")
##    process_all_images(r"c:\nlp\finance_hack\scans")
    pass

if __name__ == '__main__':
    main()
