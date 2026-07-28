import pandas as pd

from utils.model_loader import load_model

spammer_model = load_model("fake_spammer_model.pkl")


def predict_spammer(data: dict):

    df = pd.DataFrame([data])

    prediction = spammer_model.predict(df)[0]

    return {
        "prediction": int(prediction),
        "result": "Fake" if prediction == 1 else "Real"
    }