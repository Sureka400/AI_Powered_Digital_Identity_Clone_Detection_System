from dotenv import load_dotenv
import os

load_dotenv()

APP_NAME = os.getenv("APP_NAME")
HOST = os.getenv("HOST")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG") == "True"

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "digital_identity")