import json
import os

from config.database import history_collection


class HistoryService:

    FILE = "history/history.json"

    @staticmethod
    def _normalize_email(email):
        return email.strip().lower() if isinstance(email, str) and email.strip() else None

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
    def get(analyst_email=None):
        analyst_email = HistoryService._normalize_email(analyst_email)
        if history_collection is not None:
            query = {"analyst_email": analyst_email} if analyst_email else {}
            results = list(history_collection.find(query, {"_id": 0}).sort("timestamp", -1))
            return results

        if not os.path.exists(HistoryService.FILE):
            return []

        try:
            with open(HistoryService.FILE, "r") as f:
                history = json.load(f)
                if analyst_email:
                    return [
                        item for item in history
                        if HistoryService._normalize_email(item.get("analyst_email")) == analyst_email
                    ]
                return history

        except json.JSONDecodeError:
            return []
