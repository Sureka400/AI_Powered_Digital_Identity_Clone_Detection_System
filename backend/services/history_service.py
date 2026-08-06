import json
import os

from config.database import history_collection


class HistoryService:

    FILE = "history/history.json"

    @staticmethod
    def save(data):
        if history_collection is not None:
            history_collection.insert_one(data)
            return

        os.makedirs("history", exist_ok=True)

        history = []

        if os.path.exists(HistoryService.FILE):
            try:
                with open(HistoryService.FILE, "r") as f:
                    history = json.load(f)
            except json.JSONDecodeError:
                history = []

        history.append(data)

        with open(HistoryService.FILE, "w") as f:
            json.dump(history, f, indent=4)


    @staticmethod
    def get():
        if history_collection is not None:
            results = list(history_collection.find({}, {"_id": 0}).sort("timestamp", -1))
            return results

        if not os.path.exists(HistoryService.FILE):
            return []

        try:
            with open(HistoryService.FILE, "r") as f:
                return json.load(f)

        except json.JSONDecodeError:
            return []
