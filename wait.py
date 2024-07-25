from datetime import datetime, timedelta, timezone
from dateutil import tz
from time import sleep
import requests

t = 0
while (True):
    url = 'https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/used/'
    JST = tz.gettz('Asia/Tokyo')
    filename = datetime.now(JST).date().strftime('%y-%m-%d')+'.csv'
    urlData = requests.get(url+filename).content
    if urlData != b'404: Not Found':
        break
    sleep(1)
    t += 1
    print(t)
