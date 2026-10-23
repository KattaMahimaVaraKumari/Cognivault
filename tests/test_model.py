"""Simple tests for Cognivault AI Random Forest model and pipeline."""

from pathlib import Path
import joblib
import pandas as pd
import pytest
from cognivault.config import FEATURE_COLUMNS, RISK_LEVEL_CLASSES, RAW_DATA_PATH, PROCESSED_DATA_PATH


def test_processed_dataset_exists_and_valid():
    """Verify that the cleaned dataset exists and has the expected shape and columns."""
    assert PROCESSED_DATA_PATH.exists(), f"Processed dataset missing at {PROCESSED_DATA_PATH}"
    df = pd.read_csv(PROCESSED_DATA_PATH)
    assert len(df) == 1900, f"Expected 1900 cleaned rows, got {len(df)}"
    for col in FEATURE_COLUMNS:
        assert col in df.columns, f"Feature column {col} missing from cleaned dataset"
    assert "burnout_risk_level" in df.columns


def test_random_forest_model_file_exists():
    """Verify that the trained Random Forest model artifact exists."""
    model_path = Path(__file__).resolve().parent.parent / "models" / "random_forest_model.joblib"
    assert model_path.exists(), f"Trained model not found at {model_path}"


def test_random_forest_model_load_and_predict():
    """Verify that the saved model loads cleanly and predicts valid risk levels."""
    model_path = Path(__file__).resolve().parent.parent / "models" / "random_forest_model.joblib"
    model = joblib.load(model_path)

    # Verify input feature order matches the 9 configured features
    assert list(model.feature_names_in_) == FEATURE_COLUMNS

    # Sample student 1: healthy habits (low workload, high sleep)
    sample_low = pd.DataFrame([{
        "study_hours_outside_classes_per_day": 1.5,
        "academic_tasks_per_week": 4,
        "academic_workload": 1,
        "time_pressure": 1,
        "avg_sleep_hours": 8.5,
        "wakes_up_tired": 1,
        "physical_activity_days_per_week": 5,
        "difficulty_concentrating": 1,
        "academic_emotional_exhaustion": 1,
    }])[FEATURE_COLUMNS]

    # Sample student 2: severe burnout indicators (high workload, sleep deprivation)
    sample_critical = pd.DataFrame([{
        "study_hours_outside_classes_per_day": 7.0,
        "academic_tasks_per_week": 16,
        "academic_workload": 5,
        "time_pressure": 5,
        "avg_sleep_hours": 4.0,
        "wakes_up_tired": 5,
        "physical_activity_days_per_week": 0,
        "difficulty_concentrating": 5,
        "academic_emotional_exhaustion": 5,
    }])[FEATURE_COLUMNS]

    pred_low = model.predict(sample_low)[0]
    pred_critical = model.predict(sample_critical)[0]

    assert pred_low in RISK_LEVEL_CLASSES
    assert pred_critical in RISK_LEVEL_CLASSES
    assert pred_low in ["Low", "Moderate"]
    assert pred_critical in ["High", "Critical"]
