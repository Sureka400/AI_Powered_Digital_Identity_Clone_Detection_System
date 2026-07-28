import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "fake_spammer_model.pkl"
)

spammer_model = joblib.load(MODEL_PATH)


class SpammerService:

    @staticmethod
    def predict(data: dict):

        features = np.array([[
            data["edge_followed_by"],
            data["edge_follow"],
            data["username_length"],
            data["username_has_number"],
            data["full_name_has_number"],
            data["full_name_length"],
            data["is_private"],
            data["is_joined_recently"],
            data["has_channel"],
            data["is_business_account"],
            data["has_guides"],
            data["has_external_url"]
        ]])

        prediction = int(spammer_model.predict(features)[0])

        return {
            "prediction": prediction,
            "result": "Fake" if prediction == 1 else "Real"
        }