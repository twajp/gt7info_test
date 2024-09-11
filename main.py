from datetime import datetime, timedelta, timezone
import csv
import json
import requests


def LoadCSV(directory, filename):
    url = f'https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/{directory}/{filename}'
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


def GetCarinfo(car_id, carList):
    for i in range(len(carList)):
        if car_id == carList[i][0]:
            return {'name': carList[i][1], 'maker_id': int(carList[i][2])}


def GetMakerInfo(maker_id, makerList):
    for i in range(len(makerList)):
        if maker_id == makerList[i][0]:
            return {'name': makerList[i][1], 'country_id': int(makerList[i][2])}


def GetCountryInfo(country_id, countryList):
    for i in range(len(countryList)):
        if country_id == countryList[i][0]:
            return {'name': countryList[i][1], 'code': countryList[i][2]}


def GetCargroup(car_id, cargroupList):
    for i in range(len(cargroupList)):
        if car_id == cargroupList[i][0]:
            return cargroupList[i][1]


def GetEngineSwapInfo(car_id, engineswapList, carList, makerList):
    res = []
    for i in range(len(engineswapList)):
        if car_id == engineswapList[i][0]:
            car = GetCarinfo(engineswapList[i][1], carList)
            maker = GetMakerInfo(str(car['maker_id']), makerList)
            res.append({
                'maker_id': car['maker_id'],
                'maker_name': maker['name'],
                'car_id': engineswapList[i][1],
                'car_name': car['name'],
                'engine_name': engineswapList[i][2]
            })
    return res


def MakeNewCarList(data, carList, makerList, countryList, cargroupList, engineswapList):
    res = []
    for i in range(len(data)):
        if data[i][2] == 'new':
            car_id = int(data[i][0])
            price = int(data[i][1])
            price_jp = int(data[i][1]) * 100

            car = GetCarinfo(str(car_id), carList)
            maker = GetMakerInfo(str(car['maker_id']), makerList)
            country = GetCountryInfo(str(maker['country_id']), countryList)
            car_group = GetCargroup(str(car_id), cargroupList)
            engine_swaps = GetEngineSwapInfo(str(car_id), engineswapList, carList, makerList)

            try:
                carYear = int(car['name'][-2:])
                if carYear >= 29 or carYear == 0:
                    isOld = True
                else:
                    isOld = False
            except:
                isOld = None

            res.append({
                'maker_id': car['maker_id'],
                'maker_name': maker['name'],
                'car_id': car_id,
                'car_name': car['name'],
                'car_group': car_group,
                'country_id': maker['country_id'],
                'country_name': country['name'],
                'country_code': country['code'],
                'engine_swaps': engine_swaps,
                'price': price,
                'price_jp': price_jp,
                'isOld': isOld
            })
    return res


def GetLastSeen(data, data_prev, date_to_import):
    res = {}
    for i in range(len(data)):
        res.update({data[i][0]: today})
    for i in range(len(data)):
        if data[i][2] == 'soldout':
            for j in range(len(data_prev)):
                if data[i][0] == data_prev[j][0] and data_prev[j][2] != 'soldout':
                    res.update({data[i][0]: date_to_import - timedelta(1)})
    return res


def UpdateDB(lastSeen):
    for day in data['content']:
        for dealer in ['used', 'legend']:
            for car in day[dealer]:
                db[dealer][str(car['car_id'])] = car.copy()
                # del db[dealer][str(car['car_id'])]['car_id']
                if str(car['car_id']) in lastSeen[dealer]:
                    db[dealer][str(car['car_id'])].update({'lastSeen': lastSeen[dealer][str(car['car_id'])].strftime('%Y/%m/%d')})

    db.update({'timestamp': timestamp})

    for dealer in ['used', 'legend']:
        for car_id, car_info in db[dealer].items():
            car_info['sinceLastSeen'] = (today - datetime.strptime(car_info['lastSeen'], '%Y/%m/%d').date()).days
        # Sort the entries by 'sinceLastSeen'
        db[dealer] = dict(sorted(db[dealer].items(), key=lambda item: item[1]['sinceLastSeen'], reverse=True))

    db['used'] = dict(sorted(db['used'].items(), key=lambda item: (today - datetime.strptime(item[1]['lastSeen'], '%Y/%m/%d').date()).days, reverse=True))
    db['legend'] = dict(sorted(db['legend'].items(), key=lambda item: (today - datetime.strptime(item[1]['lastSeen'], '%Y/%m/%d').date()).days, reverse=True))


db = LoadJSON(f'https://raw.githubusercontent.com/twajp/gt7info_test/gh-pages/db.json')
carList = LoadCSV('db', 'cars.csv')
makerList = LoadCSV('db', 'maker.csv')
countryList = LoadCSV('db', 'country.csv')
cargroupList = LoadCSV('db', 'cargrp.csv')
engineswapList = LoadCSV('db', 'engineswaps.csv')
today = datetime.now(timezone.utc).date()
timestamp = datetime.now(timezone.utc).isoformat()
# start_date = datetime(year=2022, month=6, day=28).date()
# number_of_days = (today-start_date).days + 1
number_of_days = 100
data = {
    'timestamp': timestamp,
    'content': []
}
lastSeen = {
    'used': {},
    'legend': {}
}

for i in reversed(range(number_of_days)):
    date_to_import = today - timedelta(i)
    date_to_import_prev = today - timedelta(i+1)
    filename = date_to_import.strftime('%y-%m-%d')+'.csv'
    filename_prev = date_to_import_prev.strftime('%y-%m-%d')+'.csv'

    data_used = LoadCSV('used', filename)
    data_legend = LoadCSV('legend', filename)
    data_prev_used = LoadCSV('used', filename_prev)
    data_prev_legend = LoadCSV('legend', filename_prev)

    list_used = MakeNewCarList(data_used, carList, makerList, countryList, cargroupList, engineswapList)
    list_legend = MakeNewCarList(data_legend, carList, makerList, countryList, cargroupList, engineswapList)

    lastSeen['used'].update(GetLastSeen(data_used, data_prev_used, date_to_import))
    lastSeen['legend'].update(GetLastSeen(data_legend, data_prev_legend, date_to_import))

    data['content'].insert(0, {
        'id': int(date_to_import.strftime('%Y%m%d')),
        'date': date_to_import.strftime('%Y/%-m/%-d'),
        'used': list_used,
        'legend': list_legend,
    })
    print(f'Day {number_of_days-i}')

UpdateDB(lastSeen)

with open('data.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

with open('db.json', 'w') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
