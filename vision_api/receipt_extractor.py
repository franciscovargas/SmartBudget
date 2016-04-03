# <description>
#
# Copyright:   (c) Daniel Duma 2016
# Author: Daniel Duma <danielduma@gmail.com>

# For license information, see LICENSE.TXT

import re, datetime

STORE_PATTERNS={
    "Tesco":"tesco",
    "Farmfoods":"farm foods",
    "Lidl":"lidl",
    "National Rail":"national rail",
}

date_pattern=re.compile(r"(\d{1,2})/(\d{1,2})/(\d{1,2})\s+(\d{1,2}):(\d{1,2})")

def findPattern(patterns,text):
    for item in patterns:
        if re.search(patterns[item],text, flags=re.IGNORECASE):
            return item

def getPrice(text):
    """
        Returns price if it looks like a price, None otherwise
    """
    price=re.search(ur"[£$€]?\s?(\-?\d+\.\d+)", text)
    if price:
        try:
            price=float(price.group(1))
            return price
        except:
            return None
    else:
        return None

def isAllDigits(text):
    """
    """
    return re.match(r"[0-9\.\s]+",text,re.IGNORECASE) and not re.search(r"[a-zA-Z\s]+",text,re.IGNORECASE)

class OCRReceiptExtractor(object):
    """
    """

    def __init__(self, annotations):
        """
        """
        self.full_text=annotations[0]["description"]
        self.annotations=annotations
        self.lines=self.full_text.split("\n")
        self.store=None
        self.items=[]
        self.total=None
        self.date=None

    def guessStore(self):
        """
        """
        self.store=findPattern(STORE_PATTERNS,self.full_text)
        return self.store

    def processTescoData(self):
        """
        """
        all_items=[]

        buffer_item=None
        buffer_price=None
        skip_price=0
        skip_line=0

        for index, line in enumerate(self.lines):
            desc=line
            if skip_line > 0:
                skip_line-=1
                continue

            if re.match(r"TOTAL\s+(TO\s+PAY)?",desc,flags=re.IGNORECASE):
                price=None
                cnt=index
                while not price and cnt < len(self.lines):
                    cnt+=1
                    price=getPrice(self.lines[cnt])
                    if price:
                        self.total=price
                break


        for index, line in enumerate(self.lines):
            desc=line
            if skip_line > 0:
                skip_line-=1
                continue

            if re.search(r"(TESCO|TEL)",desc,flags=re.IGNORECASE):
                skip_line+=1
                continue

            if re.search(r"SUB",desc,flags=re.IGNORECASE):
                skip_price+=1
                continue

            if re.search(r"TOTAL\s+SAVINGS",desc,flags=re.IGNORECASE):
                break

            if re.search(r"VISA DEBIT",desc,flags=re.IGNORECASE):
                break

            price=getPrice(desc)
            if price:
                if skip_price > 0:
                    skip_price -= 1
                    continue

                if buffer_item:
                    all_items.append({"description":buffer_item,"price":price})
                    buffer_item=None
                else:
                    continue
            else:
                if isAllDigits(desc):
                    continue

                if buffer_item:
                    buffer_item+=" "+desc
                else:
                    buffer_item=desc

        self.items=all_items
##        date_line=" ".join([line["description"] for line in self.lines[-2:]])
        date_line=" ".join(self.lines[-2:])
        date=date_pattern.search(date_line)
        if date:
            self.date=datetime.datetime(int(date.group(3)), # year
                                        int(date.group(2)), # month
                                        int(date.group(1)), # day
                                        int(date.group(4)), # hour
                                        int(date.group(5)), # minute
                                        )
        return self.getDataDict()


    def processFarmfoodsData(self):
        """
        """
        all_items=[]

        buffer_item=None
        buffer_price=None
        skip_price=0
        skip_line=0
        start_at=len(self.lines)-1

        #Date: 03/02/2016 Time 09:22
        for index, desc in enumerate(self.lines):
            date=re.search("Date.*?(\d{1,2})[/i\s]+(\d{1,2})[/i\s]+(\d{4})", desc)
            if date:
                time=re.search("Ti[mn]e.*?(\d{1,2})[\:]+(\d{1,2})", desc, flags=re.DOTALL)
                h=m=0
                if time:
                    h=time.group(1)
                    m=time.group(2)
                self.date=datetime.datetime(int(date.group(3)), # year
                                            int(date.group(2)), # month
                                            int(date.group(1)), # day
                                            int(h), # hour
                                            int(m), # minute
                                            )
                break

        for index, desc in enumerate(self.lines):
            if re.search("DESCRIPTION", desc):
                start_at=index+1
                break

        for index, desc in enumerate(self.lines[start_at:]):
            if skip_line > 0:
                skip_line-=1
                continue

            if re.search(r"SAVING",desc,flags=re.IGNORECASE):
                skip_line+=1
                buffer_item=None
                continue

            total=re.search(r"Total\s+due\:\s+(.*)",desc,flags=re.IGNORECASE)
            if total:
                price=getPrice(total.group(1))
                if price:
                    self.total=price
                break

            price=getPrice(desc)
            if price:
                if skip_price > 0:
                    skip_price -= 1
                    continue

                if buffer_item:
                    all_items.append({"description":buffer_item,"price":price})
                    buffer_item=None
                else:
                    continue
            else:
                if isAllDigits(desc):
                    continue

                if buffer_item:
                    buffer_item+=" "+desc
                else:
                    buffer_item=desc

        self.items=all_items
        date_line=" ".join([line["description"] for line in self.annotations[-7:]])
        date=date_pattern.search(date_line)
        if date:
            self.date=datetime.datetime(int(date.group(1)), # day
                                        int(date.group(2)), # month
                                        int(date.group(3)), # year
                                        int(date.group(4)), # hour
                                        int(date.group(5)), # minute
                                        )
        return self.getDataDict()


    def getDataDict(self):
        """
            Returns a dict with all the extracted info
        """
        return {
                "company": self.store,
                "datetime": self.date.isoformat(" "),
                "total": self.total,
                "items": self.items,
                }

    def processData(self):
        """
        """
        if not self.store: self.guessStore()

        if self.store=="Tesco":
            return self.processTescoData()
        elif self.store=="Farmfoods":
            return self.processFarmfoodsData()
        else:
            print("Cannot identify store")
            print(self.annotations[:3])
            return None

def main():
    pass

if __name__ == '__main__':
    main()
