"""
Database configuration.

This project uses MongoDB for history persistence when MONGODB_URI is set.
Fallback storage remains the local JSON history file if MongoDB is unavailable.
"""

try:
    from pymongo import MongoClient
    from pymongo.errors import PyMongoError
except ImportError:
    MongoClient = None
    PyMongoError = Exception

from .settings import MONGODB_URI, MONGODB_DB

mongo_client = None
history_collection = None

if MONGODB_URI and MongoClient is not None:
    try:
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command('ping')
        history_collection = mongo_client[MONGODB_DB]["history"]
    except PyMongoError:
        mongo_client = None
        history_collection = None
