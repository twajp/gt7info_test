import os
import csv
import json
from datetime import datetime, timedelta, timezone
from dateutil import tz
from shutil import copyfile
import requests
from jinja2 import Environment, FileSystemLoader
from time import sleep


def LoadCSV(directory, filename):
    url = f"https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/{directory}{filename}"
    download = requests.get(url)
    decoded_content = download.content.decode('utf-8')
    cr = csv.reader(decoded_content.splitlines(), delimiter=',')
    data = list(cr)
    return data


def MakeNewCarList(data, carList, makerList):
    res = []
    for i in range(len(data)):
        if data[i][2] == "new":
            for j in range(len(carList)):
                if data[i][0] == carList[j][0]:
                    for k in range(len(makerList)):
                        if carList[j][2] == makerList[k][0]:
                            makername = makerList[k][1]
                            carid = carList[j][0]
                            carname = carList[j][1]
                            price = format(int(data[i][1]), ",")
                            price_in_jpy = format(int(data[i][1])*100, ",")

                            try:
                                carYear = int(carname[-2:])
                                if carYear >= 29 or carYear == 0:
                                    isOld = True
                                else:
                                    isOld = False
                            except:
                                isOld = None

                            res.append(
                                {"makername": makername, "carid": carid, "carname": carname, "price": price, "price_in_jpy": price_in_jpy, "isOld": isOld})
    return res


carList = LoadCSV("db/", "cars.csv")
makerList = LoadCSV("db/", "maker.csv")
today = datetime.now(datetime.UTC).date()
JST = tz.gettz("Asia/Tokyo")
UTC = tz.gettz("UTC")
timestamp = datetime.now(datetime.UTC).strftime("%Y/%-m/%-d %-H:%M") + " (UTC)"
timestamp_jp = datetime.now(datetime.UTC).replace(tzinfo=UTC).astimezone(JST).replace(tzinfo=None).strftime("%Y/%-m/%-d %-H:%M") + " (JST)"
# start_date = datetime.date(year=2022,month=6,day=28)
# how_many_days = (today-start_date).days + 1
how_many_days = 14
data = []

for i in range(how_many_days):
    date_to_import = today - timedelta(i)
    filename = date_to_import.strftime("%y-%m-%d")+".csv"

    data_used = LoadCSV("used/", filename)
    data_legend = LoadCSV("legend/", filename)

    list_used = MakeNewCarList(data_used, carList, makerList)
    list_legend = MakeNewCarList(data_legend, carList, makerList)

    data.append({
        "id": date_to_import.strftime("%Y%m%d"),
        "date": date_to_import.strftime("%Y/%-m/%-d"),
        "used": list_used,
        "legend": list_legend,
    })

env = Environment(loader=FileSystemLoader("."))
template = env.get_template("template.html")

rendered = template.render({"data": data, "price": "global", "timestamp": timestamp})
rendered_jp = template.render({"data": data, "price": "jp", "timestamp": timestamp_jp})
rendered_simple = template.render({"data": data, "price": "simple", "timestamp": timestamp})

if not os.path.exists("html"):
    os.makedirs("html")

with open("html/index.html", "w") as f:
    f.write(rendered)

with open("html/jp.html", "w") as f:
    f.write(rendered_jp)

with open("html/simple.html", "w") as f:
    f.write(rendered_simple)

with open("html/data.json", "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

copyfile("style.css", "html/style.css")
copyfile("script.js", "html/script.js")
