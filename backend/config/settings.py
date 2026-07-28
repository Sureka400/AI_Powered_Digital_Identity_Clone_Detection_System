from dotenv import load_dotenv
import os

load_dotenv()

APP_NAME = os.getenv("APP_NAME")

HOST = os.getenv("HOST")

PORT = int(os.getenv("PORT"))

DEBUG = os.getenv("DEBUG") == "True"