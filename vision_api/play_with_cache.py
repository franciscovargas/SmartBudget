import json


if __name__ == "__main__":
    f = json.load(open("cached_json.json"))
    print f.keys()
