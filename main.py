import os
import csv
import json
from datetime import datetime, timedelta, timezone
from dateutil import tz
from shutil import copyfile
import requests
from jinja2 import Environment, FileSystemLoader


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
                            makername = makerList[k][1]
                            carid = carList[j][0]
                            carname = carList[j][1]
                            price = format(int(data[i][1]), ',')
                            price_in_jpy = format(int(data[i][1])*100, ',')

                            try:
                                carYear = int(carname[-2:])
                                if carYear >= 29 or carYear == 0:
                                    isOld = True
                                else:
                                    isOld = False
                            except:
                                isOld = None

                            res.append(
                                {'makername': makername, 'carid': carid, 'carname': carname, 'price': price, 'price_in_jpy': price_in_jpy, 'isOld': isOld})
    return res


def UpdateDB(dealer):
    for day in reversed(data):
        for car in day[dealer]:
            db[dealer][car['carid']] = {
                'makername': car['makername'],
                'carname': car['carname'],
                'price': car['price'],
                'price_in_jpy': car['price_in_jpy'],
                'isOld': car['isOld'],
                'lastAppeared': day['date'],
            }


def Select(cars_dict, percentage):
    num_top_cars = int(len(cars_dict) / 100 * percentage)
    db_top = dict(list(cars_dict.items())[:num_top_cars])
    for car_id, car_info in db_top.items():
        db_top[car_id].update({'sinceLastAppeared': (today - datetime.strptime(car_info['lastAppeared'], '%Y/%m/%d').date()).days})

    return db_top


db = LoadJSON(f'https://raw.githubusercontent.com/twajp/gt7info_test/gh-pages/db.json')
carList = LoadCSV('db/', 'cars.csv')
makerList = LoadCSV('db/', 'maker.csv')
today = datetime.now(timezone.utc).date()
JST = tz.gettz('Asia/Tokyo')
timestamp = datetime.now(timezone.utc).strftime('%Y/%-m/%-d %-H:%M') + ' (UTC)'
timestamp_jp = datetime.now(timezone.utc).astimezone(JST).strftime('%Y/%-m/%-d %-H:%M') + ' (JST)'
# start_date = datetime.date(year=2022,month=6,day=28)
# how_many_days = (today-start_date).days + 1
how_many_days = 14
data = []

for i in range(how_many_days):
    date_to_import = today - timedelta(i)
    filename = date_to_import.strftime('%y-%m-%d')+'.csv'

    data_used = LoadCSV('used/', filename)
    data_legend = LoadCSV('legend/', filename)

    list_used = MakeNewCarList(data_used, carList, makerList)
    list_legend = MakeNewCarList(data_legend, carList, makerList)

    data.append({
        'id': date_to_import.strftime('%Y%m%d'),
        'date': date_to_import.strftime('%Y/%-m/%-d'),
        'used': list_used,
        'legend': list_legend,
    })
    print(f'Day {i+1}')


UpdateDB('used')
UpdateDB('legend')

db['used'] = dict(sorted(db['used'].items(), key=lambda item: (today - datetime.strptime(item[1]['lastAppeared'], '%Y/%m/%d').date()).days, reverse=True))
db['legend'] = dict(sorted(db['legend'].items(), key=lambda item: (today - datetime.strptime(item[1]['lastAppeared'], '%Y/%m/%d').date()).days, reverse=True))

db_top = {}
db_top['used'] = Select(db['used'], percentage=20)
db_top['legend'] = Select(db['legend'], percentage=10)

# Filter out cars where isOld is False
db_top['used'] = {k: v for k, v in db_top['used'].items() if v['isOld'] != False}
db_top['legend'] = {k: v for k, v in db_top['legend'].items() if v['isOld'] != False}

env = Environment(loader=FileSystemLoader('.'))
template = env.get_template('template.html')

rendered = template.render({'data': data, 'price': 'global', 'timestamp': timestamp, 'db_top': db_top})
rendered_jp = template.render({'data': data, 'price': 'jp', 'timestamp': timestamp_jp, 'db_top': db_top})
rendered_simple = template.render({'data': data, 'price': 'simple', 'timestamp': timestamp, 'db_top': db_top})

if not os.path.exists('html'):
    os.makedirs('html')

with open('html/index.html', 'w') as f:
    f.write(rendered)

with open('html/jp.html', 'w') as f:
    f.write(rendered_jp)

with open('html/simple.html', 'w') as f:
    f.write(rendered_simple)

with open('html/data.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

with open('html/db.json', 'w') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

copyfile('style.css', 'html/style.css')
copyfile('script.js', 'html/script.js')
