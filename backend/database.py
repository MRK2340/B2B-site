from pymongo import MongoClient
import os

client = MongoClient(os.environ.get("MONGO_URL"))
db = client[os.environ.get("DB_NAME")]
