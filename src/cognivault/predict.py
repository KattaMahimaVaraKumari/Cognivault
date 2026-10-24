"""Simple inference interface for Cognivault Random Forest model."""

from pathlib import Path
from typing import Any, Dict
import joblib
import pandas as pd
from cognivault.config import FEATURE_COLUMNS, RISK_LEVEL_CLASSES

# Resolve default model path
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "models" / "random_forest_model.joblib"


def predict_burnout_risk(
    survey_input: Dict[str, Any],
    model_path: Path = DEFAULT_MODEL_PATH,
) -> Dict[str, Any]:
    """
    Predict student burnout risk level from a dictionary of the 9 survey features.

    Parameters
    ----------
    survey_input : dict
        Dictionary containing the 9 survey feature key-value pairs.
    model_path : Path, optional
        Path to the saved Random Forest joblib model.

    Returns
    -------
    dict
        Prediction results including:
        - 'burnout_risk_level': str ('Low', 'Moderate', 'High', 'Critical')
        - 'confidence': float (probability of predicted class)
        - 'probabilities': dict of class probabilities in natural risk order
    """
    if not Path(model_path).exists():
        raise FileNotFoundError(f"Model file not found at {model_path}")

    # Verify all required features exist
    missing_features = [col for col in FEATURE_COLUMNS if col not in survey_input]
    if missing_features:
        raise ValueError(f"Missing required survey feature(s): {missing_features}")

    # Build single-row DataFrame in exact feature order
    input_df = pd.DataFrame([survey_input])[FEATURE_COLUMNS]

    # Load model
    model = joblib.load(model_path)

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
        "burnout_risk_level": predicted_level,
        "confidence": confidence,
        "probabilities": probabilities,
    }
