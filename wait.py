from datetime import datetime, timedelta, timezone
from time import sleep
import requests

while (True):
    url = 'https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/used/'
    JST = timezone(timedelta(hours=+9), 'JST')
    filename = datetime.now(JST).date().strftime('%y-%m-%d')+'.csv'
    urlData = requests.get(url+filename).content
    if urlData != b'404: Not Found':
        break
    sleep(1)
