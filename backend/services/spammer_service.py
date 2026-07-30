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

        # Try to get probability scores for confidence
        confidence = None
        spammer_probability = None
        try:
            if hasattr(spammer_model, "predict_proba"):
                proba = spammer_model.predict_proba(features)[0]
                # Assume class order is [0=Real, 1=Fake/Spammer]; adjust if needed
                if len(proba) >= 2:
                    confidence = round(float(max(proba)) * 100, 2)
                    spammer_probability = round(float(proba[1]) * 100, 2)
        except Exception:
            pass

        return {
            "prediction": prediction,
            "result": "Fake" if prediction == 1 else "Real",
            "confidence": confidence,
            "spammer_probability": spammer_probability
        }
