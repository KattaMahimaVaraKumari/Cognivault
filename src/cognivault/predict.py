"""Inference interface for Cognivault Logistic Regression burnout risk model."""

from pathlib import Path
from typing import Any, Dict
import joblib
import pandas as pd
from cognivault.config import FEATURE_COLUMNS, RISK_LEVEL_CLASSES

# Default champion model selected for Cognivault
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "models" / "logistic_regression_model.joblib"


def predict_burnout_risk(
    survey_input: Dict[str, Any],
    model_path: Path = DEFAULT_MODEL_PATH,
) -> Dict[str, Any]:
    """
    Predict student burnout risk level from a dictionary of the 9 survey features.

    Uses the project's selected Logistic Regression pipeline (StandardScaler + LogisticRegression).

    Parameters
    ----------
    survey_input : dict
        Dictionary containing the 9 survey feature key-value pairs.
    model_path : Path, optional
        Path to the saved joblib model. Defaults to logistic_regression_model.joblib.

    Returns
    -------
    dict
        Prediction results:
        - 'model_used': str ('LogisticRegression')
        - 'burnout_risk_level': str ('Low', 'Moderate', 'High', 'Critical')
        - 'confidence': float (probability of predicted class)
        - 'probabilities': dict of class probabilities in natural risk order
    """
    path_obj = Path(model_path)
    if not path_obj.exists():
        raise FileNotFoundError(f"Model file not found at {path_obj}")

    # Verify all 9 required features exist
    missing_features = [col for col in FEATURE_COLUMNS if col not in survey_input]
    if missing_features:
        raise ValueError(f"Missing required survey feature(s): {missing_features}")

    # Build single-row DataFrame in exact feature order
    input_df = pd.DataFrame([survey_input])[FEATURE_COLUMNS]

    # Load model pipeline (StandardScaler + LogisticRegression)
    model = joblib.load(path_obj)

    # Predict class & probabilities
    predicted_level = str(model.predict(input_df)[0])
    raw_probas = model.predict_proba(input_df)[0]
    proba_map = dict(zip(model.classes_, raw_probas))

    probabilities = {
        level: round(float(proba_map.get(level, 0.0)), 4)
        for level in RISK_LEVEL_CLASSES
    }
    confidence = probabilities[predicted_level]

    return {
        "status": "success",
        "model_used": "LogisticRegression",
        "burnout_risk_level": predicted_level,
        "confidence": confidence,
        "probabilities": probabilities,
    }
