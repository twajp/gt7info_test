import csv
import json
from datetime import datetime, timedelta, timezone
from dateutil import tz
import requests


def LoadCSV(directory, filename):
    url = f'https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/{directory}{filename}'
    download = requests.get(url)
    decoded_content = download.content.decode('utf-8')
    cr = csv.reader(decoded_content.splitlines(), delimiter=',')
    data = list(cr)

    return data


def LoadJSON(url):
    download = requests.get(url)
    decoded_content = download.content.decode('utf-8')
    db = json.loads(decoded_content)

    return db


def MakeNewCarList(data, carList, makerList):
    res = []
    for i in range(len(data)):
        if data[i][2] == 'new':
            for j in range(len(carList)):
                if data[i][0] == carList[j][0]:
                    for k in range(len(makerList)):
                        if carList[j][2] == makerList[k][0]:
                            carid = int(carList[j][0])
                            makername = makerList[k][1]
                            carname = carList[j][1]
                            price = int(data[i][1])
                            price_in_jpy = int(data[i][1])*100

                            try:
                                carYear = int(carname[-2:])
                                if carYear >= 29 or carYear == 0:
                                    isOld = True
                                else:
                                    isOld = False
                            except:
                                isOld = None

                            res.append(
                                {'carid': carid, 'makername': makername, 'carname': carname, 'price': price, 'price_in_jpy': price_in_jpy, 'isOld': isOld})
    return res


def UpdateDB():
    for dealer in ['used', 'legend']:
        for day in reversed(data['content']):
            for car in day[dealer]:
                db[dealer][car['carid']] = {
                    'makername': car['makername'],
                    'carname': car['carname'],
                    'price': car['price'],
                    'price_in_jpy': car['price_in_jpy'],
                    'isOld': car['isOld'],
                    'lastAppeared': day['date'],
                }

    db.update({'timestamp': timestamp})
    db.update({'timestamp_jp': timestamp_jp})

    for dealer in ['used', 'legend']:
        for car_id, car_info in db[dealer].items():
            car_info['sinceLastAppeared'] = (today - datetime.strptime(car_info['lastAppeared'], '%Y/%m/%d').date()).days
        # Sort the entries by 'sinceLastAppeared'
        db[dealer] = dict(sorted(db[dealer].items(), key=lambda item: item[1]['sinceLastAppeared'], reverse=True))

    db['used'] = dict(sorted(db['used'].items(), key=lambda item: (today - datetime.strptime(item[1]['lastAppeared'], '%Y/%m/%d').date()).days, reverse=True))
    db['legend'] = dict(sorted(db['legend'].items(), key=lambda item: (today - datetime.strptime(item[1]['lastAppeared'], '%Y/%m/%d').date()).days, reverse=True))


db = LoadJSON(f'https://raw.githubusercontent.com/twajp/gt7info_test/gh-pages/db.json')
carList = LoadCSV('db/', 'cars.csv')
makerList = LoadCSV('db/', 'maker.csv')
today = datetime.now(timezone.utc).date()
JST = tz.gettz('Asia/Tokyo')
timestamp = datetime.now(timezone.utc).strftime('%Y/%-m/%-d %-H:%M') + ' (UTC)'
timestamp_jp = datetime.now(timezone.utc).astimezone(JST).strftime('%Y/%-m/%-d %-H:%M') + ' (JST)'
# start_date = datetime(year=2022, month=6, day=28).date()
# how_many_days = (today-start_date).days + 1
how_many_days = 14
data = {
    'timestamp': timestamp,
    'timestamp_jp': timestamp_jp,
    'content': []
}

for i in range(how_many_days):
    date_to_import = today - timedelta(i)
    filename = date_to_import.strftime('%y-%m-%d')+'.csv'

    data_used = LoadCSV('used/', filename)
    data_legend = LoadCSV('legend/', filename)

    list_used = MakeNewCarList(data_used, carList, makerList)
    list_legend = MakeNewCarList(data_legend, carList, makerList)

    data['content'].append({
        'id': int(date_to_import.strftime('%Y%m%d')),
        'date': date_to_import.strftime('%Y/%-m/%-d'),
        'used': list_used,
        'legend': list_legend,
    })
    print(f'Day {i+1}')

UpdateDB()

with open('data.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

with open('db.json', 'w') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
