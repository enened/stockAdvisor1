from dotenv import load_dotenv
import os
import requests
import json
import tweepy
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords, subjectivity
from nltk.classify import NaiveBayesClassifier
from nltk.sentiment import SentimentAnalyzer
from nltk.sentiment.util import *
from nltk.sentiment.vader import SentimentIntensityAnalyzer
nltk.download("punkt")
nltk.download("stopwords")
nltk.download("vader_lexicon")

import threading
import time
import math
import yfinance as yf 
from cleanco import basename

# nltk.download("punkt")
# nltk.download("stopwords")
# nltk.download("vader_lexicon")

load_dotenv()

client = tweepy.Client(os.getenv("bearer_token"))
update_interval = 60.0


tweets_folder = "tweets"
companies = set()
company_ratings = {}


def load_companies():
    file = open("companies.txt", "rt")
    
    

    for company in file:
        companies.add(str(company).strip())
        
    file.close()
    
    
#TO-DO Make a service to run this function every interval
def refresh_data():
    file = open("stock_influencers.txt")
    
    for line in file:        
        
        user = client.get_user(username=str(line).strip())
        if user.data == None:
            print(str(line).strip(),  "got banned")
            continue
        userid = user.data.id
        thread = threading.Thread(target=write_data, args=(userid, str(line).strip()))
        thread.start()
        
        
    file.close()



def parse_data(influencer):
    file = open(tweets_folder + "/" + influencer + ".json")
    tweet_data = json.loads(file.read())
    file.close()
    tweets = tweet_data["tweets"]
    
    for tweet in tweets:
        company_keywords = tweet["company_keywords"]
        rating = tweet["rating"]
        write_company_rating(company_keywords, rating)

    

def write_data(userid, username):
    tweets = client.get_users_tweets(id=userid, max_results=100, tweet_fields=['id', 'text', 'created_at', 'context_annotations'], exclude="replies")
    if tweets.data==None:
        print(username, "is banned or doesn't have any tweets available")
        return
    json_array = []
    last_updated = int(time.time())

    for tweet in tweets.data:
        created_at = int(round(tweet.created_at.timestamp()))
        text = tweet.text
        company_keywords = get_company_keywords(text.replace("@", ""))

        if len(company_keywords) == 0:
            continue
        sid = SentimentIntensityAnalyzer()
        score_set = sid.polarity_scores(text)
        
        
        write_company_rating(company_keywords, score_set["compound"])
        json_array.append(
            {
                "created_at": created_at,
                "text": text,
                "rating": score_set["compound"],
                "company_keywords": list(company_keywords)
            }
        )
    file = open(tweets_folder + "/" + username + ".json", "w")
    file.write(
        json.dumps({ 
            "last_updated": last_updated,
            "tweets": list(json_array)
        }, indent=4)
    )
    file.close()
    print("done for", username)
    


def get_company_keywords(text):
    list = de_noise(text)
    i = 0   
    
    keywords = set()

    for word in list:        
        
        if word.lower() in companies:
            keywords.add(word.lower())
    
    
    return keywords

def de_noise(text):
    list = word_tokenize(text)
    filtered_list = []
    stop_words = set(stopwords.words("english"))
    for word in list:
        if word not in stop_words:
            filtered_list.append(word)
    return filtered_list

# def softmax(array):
#     total = 0
#     for i in range(len(array)):
#         array[i] = math.exp(array[i])
#         total += array[i]
#     array /= total
#     return array

def get_ratings(symbol_array):
    average_ratings = []
    for symbol in symbol_array:        
        stock = yf.Ticker(symbol.upper())
        company_name = basename(stock.info["shortName"]).lower()
        if company_name not in company_ratings:
            average_ratings.append(0.0)
            continue
        total = company_ratings[company_name]["sum"]
        count = company_ratings[company_name]["count"]
        
        average_ratings.append(total/count)
    return average_ratings
def load_local_data():
    
    for file_name in os.listdir(tweets_folder):
        parse_data(file_name[:-5])


def write_company_rating(company_keywords, score):
    for company_keyword in company_keywords:
        sum = score
        count = 1
        if company_keyword in company_ratings:
            rating = company_ratings[company_keyword]
            sum += rating["sum"]
            count += rating["count"]
        company_ratings.update(
            { 
                company_keyword: {
                    "sum": sum,
                    "count": count
                }
            }
        )
    

# load_companies()
# refresh_data()
# load_local_data()








    
            
   
    
    