import json
import os


class HistoryService:

    FILE = "history/history.json"

    @staticmethod
    def save(data):

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

        if not os.path.exists(HistoryService.FILE):
            return []

        try:
            with open(HistoryService.FILE, "r") as f:
                return json.load(f)

        except json.JSONDecodeError:
            return []