import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "fake_profile_model.pkl"
)

profile_model = joblib.load(MODEL_PATH)


class ProfileService:

    @staticmethod
    def predict(data: dict):

        features = np.array([[
            data["profile_pic"],
            data["username_length"],
            data["fullname_words"],
            data["fullname_length"],
            data["name_equals_username"],
            data["description_length"],
            data["external_url"],
            data["private"],
            data["posts"],
            data["followers"],
            data["following"]
        ]])

        prediction = int(profile_model.predict(features)[0])

        return {
            "prediction": prediction,
            "result": "Fake" if prediction == 1 else "Real"
        }