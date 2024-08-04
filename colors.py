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


def MakeCarList(carList, makerList):
    res = {}
    for i in range(1, len(carList)):
        for j in range(1, len(makerList)):
            if carList[i][2] == makerList[j][0]:
                car_id = int(carList[i][0])
                maker_id = int(makerList[j][0])
                maker_name = makerList[j][1]
                maker_country = int(makerList[j][2])
                car_name = carList[i][1]

                try:
                    carYear = int(car_name[-2:])
                    if carYear >= 29 or carYear == 0:
                        isOld = True
                    else:
                        isOld = False
                except:
                    isOld = None

                res[car_id] = {'car_id': car_id, 'car_name': car_name, 'maker_id': maker_id, 'maker_name': maker_name,  'maker_country': maker_country, 'isOld': isOld, 'colors': [], 'default_color': None}
    return res


carList = LoadCSV('db', 'cars.csv')
makerList = LoadCSV('db', 'maker.csv')

carList = MakeCarList(carList, makerList)

with open('colors.json', 'w') as f:
    json.dump(carList, f, indent=2, ensure_ascii=False)
