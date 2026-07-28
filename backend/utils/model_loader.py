import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

MODELS_DIR = os.path.join(BASE_DIR, "models")


def load_model(model_name: str):
    """
    Load a .pkl model from the models folder.
    """

    model_path = os.path.join(MODELS_DIR, model_name)

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    return joblib.load(model_path)