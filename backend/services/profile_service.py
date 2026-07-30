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

        # Try to get probability scores for confidence
        confidence = None
        fake_probability = None
        try:
            if hasattr(profile_model, "predict_proba"):
                proba = profile_model.predict_proba(features)[0]
                # Assume class order is [0=Real, 1=Fake]; adjust if needed
                if len(proba) >= 2:
                    confidence = round(float(max(proba)) * 100, 2)
                    fake_probability = round(float(proba[1]) * 100, 2)
        except Exception:
            pass

        return {
            "prediction": prediction,
            "result": "Fake" if prediction == 1 else "Real",
            "confidence": confidence,
            "fake_probability": fake_probability
        }
