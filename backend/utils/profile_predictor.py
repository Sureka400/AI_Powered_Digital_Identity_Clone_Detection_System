import pandas as pd

from utils.model_loader import load_model

profile_model = load_model("fake_profile_model.pkl")


def predict_profile(data: dict):

    df = pd.DataFrame([data])

    prediction = profile_model.predict(df)[0]

    return {
        "prediction": int(prediction),
        "result": "Fake" if prediction == 1 else "Real"
    }