import math
import numpy as np 
import pandas as pd 
import requests
import os
import json
import random
from datetime import datetime
import time
import csv
import matplotlib
matplotlib.use('tkagg')
import matplotlib.pyplot as plt, mpld3
from sentiment_analyzer import *
#We've registered lots of emails with AlphaVantage to get these keys

keys = [
    'WWF2YGNBXK210E9A', 
    '3BJBPEWCJ3I05F0Q', 
    '495VY7LZMRER61EG', 
    'P4FVS1NXV78E3QWS', 
    'FIH76AALZDALNEYK',
    'GSSKOADRRQ3NFR23',
    'H7ROJYZACU81ZE53',
    'THODG184BTEDCGEJ',
    '0XHYPMSWV1Z09N6I',
    'OGYMYNYOT42R0IMC',
    'UJBHAKP3O2OGJ9JA',
]


'''Applies a softmax operation to an array'''
def softmax(array):
    total = 0
    for i in range(len(array)):
        array[i] = math.exp(array[i])
        total += array[i]
    array /= total
    return array

'''Used to randomize the key used in each request,
and to simplify the amount of code required for the get request.'''
def get(function, ticker):
    #AlphaVantage API Keys
    random.seed(datetime.now().timestamp())
    api_token = keys[random.randrange(0, len(keys))]
    api_url = f'https://www.alphavantage.co/query?function={function}&symbol={ticker}&apikey={api_token}'
    data = requests.get(api_url)

    if '5 calls per minute and 500 calls per day' in data.text:
        return get(function, ticker)
    else:
        return data  

    

'''Calculates the mean and standard deviation of an asset's last 30-Day's returns'''
def returns(ticker):
    temp = []
    temper = np.array([])
    function = 'TIME_SERIES_DAILY_ADJUSTED'
    request = get(function, ticker)
    while request == None:
        request = get(function, ticker)
    all_data = json.loads(request.text)
    # time series data accessed from endpoint
    data = all_data["Time Series (Daily)"]
    i = 0
    for date in data:
        if i > 30:
            break
        date = data[date]
        closing_val = float(date["4. close"])
        temp.append(closing_val)
        i+=1   
    for i in range(30, 0, -1):
        temper = np.append(temper, temp[i-1] - temp[i]) / temp[i]
    mean = np.sum(temper) / 30.0
    temper = (temper - mean)**2
    out = math.sqrt(np.sum(temper)/29.0)
    return [mean, out]

'''Returns a portfolio based off of balancing the risk of each asset'''
def balance_risk(symbols, budget):
    out = np.array([])
    for symbol in symbols:
        [alpha, beta] = returns(symbol)
        out = np.append(out, alpha / (beta)**2)
    for i in range(len(symbols)):
        if out[i] < 0:
            out[i] = 0
    out /= np.sum(out)
    out = { x:{"dollar_amount": round(budget*y, 2), "percentage_of_portfolio": 100*y} for (x, y) in zip(symbols, out) }
    out = { "assets": out, "strategy": "Risk Allocation Strategy"}
    print(out)
    return out


'''
Fetches the general data specific to the parameter (ticker) that the user requests
Ticker is the stock symbol
Returns a json object with all data
Calculates the the 30 day moving average by accessing the data of a stock at the close time of each day
'''
def moving_average(ticker): 
    function = 'TIME_SERIES_DAILY_ADJUSTED'
    request = get(function, ticker)
    while request == None:
        request = get(function, ticker)
    all_data = json.loads(request.text)
    # time series data accessed from endpoint
    data = all_data["Time Series (Daily)"]
    i = 0
    total = 0.0
    # Sums up the closing stock value of every day and divides by 30 to find the monthly average
    for date in data:
        if i >= 30:
            break
        date = data[date]
        closing_val = float(date["4. close"])
        total += closing_val
        i+=1      
    return total/30.0

'''Returns the percent growth of the 30-Day moving average,
based off of last month's 30-Day moving average,
and today's 30-Day moving average'''
def momentum(ticker): 
    function = 'TIME_SERIES_DAILY_ADJUSTED'
    request = get(function, ticker)
    while request == None:
            request = get(function, ticker)
    all_data = json.loads(request.text)
    # time series data accessed from endpoint
    data = all_data["Time Series (Daily)"]
    i = 0
    total_new = 0.0
    total_old = 0.0
    # Sums up the closing stock value of every day and divides by 30 to find the monthly average
    for date in data:
        if i >= 60:
            break
        date = data[date]
        closing_val = float(date["4. close"])
        if i < 30:
            total_new += closing_val
        else:
            total_old += closing_val
        i+=1   
    return (total_new - total_old) / total_old

'''Returns a portfolio based off of assets percent returns, 
and then applies softmax to determine allocation'''
def momentum_strategy(symbols, budget):
    out = np.zeros(len(symbols))
    temp = np.array([])
    for symbol in symbols:
        temp = np.append(temp, momentum(symbol))
    out = softmax(temp)
    out = { x:{"dollar_amount": round(budget*y, 2), "percentage_of_portfolio": 100*y} for (x, y) in zip(symbols, out) }
    out = { "assets": out, "strategy": "Momentum Investing Strategy"}
    return out

'''Returns data from the "quote" endpoint'''
def quote(symbols):
    function = 'GLOBAL_QUOTE'
    out = []
    for symbol in symbols:
        data = get(function, symbol)
        while request == None:
            request = get(function, ticker)
        data = data.json()
        out.append([symbol, data])
    return out

def getAllTickers():
    api_token = 'WWF2YGNBXK210E9A'
    list_of_all_stock_tickers = []
    url = f'https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={api_token}'
    with requests.Session() as s:
        download = s.get(url)
        decoded_content = download.content.decode('utf-8')
        cr = csv.reader(decoded_content.splitlines(), delimiter=',')
        my_list = list(cr)
        for i in range(len(my_list)):
            ticker = my_list[i][0]
            list_of_all_stock_tickers.append(ticker)
    return  list_of_all_stock_tickers

def return_plot(ticker):
    function = 'TIME_SERIES_DAILY_ADJUSTED'
    temp = []
    request = get(function, ticker)
    while request == None:
            request = get(function, ticker)
    all_data = json.loads(request.text)
    # time series data accessed from endpoint
    data = all_data["Time Series (Daily)"]
    i = 0
    # Sums up the closing stock value of every day and divides by 30 to find the monthly average
    for date in data:
        if i >= 100:
            break
        date = data[date]
        temp.insert(0, float(date["4. close"]))
        i+=1    
    fig1 = plt.figure()
    plt.xlabel('The Last 100 Days')
    plt.ylabel('Closing Price($)')
    plt.plot(temp)        
    return (mpld3.fig_to_html(fig1, d3_url=None, mpld3_url=None, no_extras=False, template_type='general', figid=None, use_http=False))

def getTickerInfo(ticker):
    returnPlot = return_plot(ticker)
    returnsInfo = returns(ticker)
    return {"returnPlot": returnPlot, "returnsInfo": returnsInfo}

def sentiment_analysis(symbols, budget):
    ratings = get_ratings(symbols)
    out = softmax(np.array(ratings))
    out = { x:{"dollar_amount": round(budget*y, 2), "percentage_of_portfolio": 100*y} for (x, y) in zip(symbols, out) }
    out = { "assets": out, "strategy": "Momentum Investing Strategy"}
    return(out)