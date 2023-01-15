from flask import Flask, jsonify, request
from flask_cors import CORS
from app import *

app = Flask(__name__)
CORS(app, resources={r'/*': {'origins': '*'}})

@app.route('/stockAdvise', methods =['POST'])
def post():
    # data from frontend
    data = request.get_json()
    
    if data['investmentStrategy'] == "Momentum investing":
        result = momentum_strategy(data['stockCodes'], float(data['investmentBudget']))
    
    elif data['investmentStrategy'] == "Risk allocation":
        result = balance_risk(data['stockCodes'], float(data['investmentBudget']))
    elif data['investmentStrategy'] == "Sentiment analysis":
        result = sentiment_analysis(data['stockCodes'], float(data['investmentBudget']))
    elif not data['stockCode']:
        result = getAllTickers()
    elif data['stockCode']:
        result = getTickerInfo(data['stockCode'])

    # sending data to the backend
    return jsonify({"result": result})



if __name__ == '__main__':
    app.run(debug = True)