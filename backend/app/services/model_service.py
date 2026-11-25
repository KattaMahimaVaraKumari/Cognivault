"""Model service to load and execute the scikit-learn Logistic Regression champion model."""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import pandas as pd
from app.config import settings

logger = logging.getLogger(__name__)

# Strict feature contract defined by training notebooks and BACKEND_INTEGRATION_GUIDE.md
FEATURE_COLUMNS: List[str] = [
    "study_hours_outside_classes_per_day",
    "academic_tasks_per_week",
    "academic_workload",
    "time_pressure",
    "avg_sleep_hours",
    "wakes_up_tired",
    "physical_activity_days_per_week",
    "difficulty_concentrating",
    "academic_emotional_exhaustion",
]

# Explicit natural risk order
RISK_ORDER: List[str] = ["Low", "Moderate", "High", "Critical"]


class ModelService:
    """Singleton service for loading and running inference on the trained ML pipeline."""

    def __init__(self, model_path: Optional[str] = None) -> None:
        self.model_path = Path(model_path or settings.MODEL_PATH)
        self.model: Any = None
        self._is_loaded: bool = False

    def load_model(self) -> None:
        """Load the serialized joblib pipeline into memory."""
        if not self.model_path.exists():
            error_msg = f"Model artifact not found at {self.model_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)

        logger.info("Loading model artifact from: %s", self.model_path)
        self.model = joblib.load(self.model_path)
        self._is_loaded = True
        logger.info("Champion model loaded successfully. Classes: %s", getattr(self.model, "classes_", "Unknown"))

    @property
    def is_loaded(self) -> bool:
        """Check whether the model artifact is loaded in memory."""
        return self._is_loaded and self.model is not None

    def predict(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run inference using the loaded model pipeline.

        Parameters
        ----------
        feature_dict : dict
            Dictionary containing values for the 9 strict features.

        Returns
        -------
        dict
            Inference outcome with burnout_risk_level, confidence, and probabilities map.
        """
        if not self.is_loaded:
            self.load_model()

        # Validate that all 9 required features are present
        missing = [col for col in FEATURE_COLUMNS if col not in feature_dict]
        if missing:
            raise ValueError(f"Missing required features for model prediction: {missing}")

        # Assemble single-row DataFrame in the exact feature column order
        input_df = pd.DataFrame([feature_dict])[FEATURE_COLUMNS]

        # Predict class (pipeline handles StandardScaler internally)
        predicted_level = str(self.model.predict(input_df)[0])

        # Predict probabilities
        raw_probas = self.model.predict_proba(input_df)[0]
        proba_map = dict(zip(self.model.classes_, raw_probas))

        # Format probabilities in natural risk order
        probabilities = {
            level: round(float(proba_map.get(level, 0.0)), 4)
            for level in RISK_ORDER
        }
        confidence = probabilities.get(predicted_level, 0.0)

        return {
            "status": "success",
            "model_used": "LogisticRegression",
            "burnout_risk_level": predicted_level,
            "confidence": confidence,
            "probabilities": probabilities,
            "features_used": {col: float(input_df[col].iloc[0]) for col in FEATURE_COLUMNS},
        }


model_service = ModelService()
