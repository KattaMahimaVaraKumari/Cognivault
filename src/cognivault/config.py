"""Configuration constants and schema definitions for Cognivault AI.

Central source of truth for features, target definitions, allowed ranges, and paths.
"""

from pathlib import Path

# Base Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_PATH = DATA_DIR / "raw" / "cognivault_final_dataset.csv"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
PROCESSED_DATA_PATH = PROCESSED_DATA_DIR / "cognivault_cleaned_dataset.csv"

# Global Reproducibility Seed
SEED = 42

# Exactly nine model input features in exact specified order
FEATURE_COLUMNS = [
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

# Explicitly excluded columns from model inputs (identifiers, demographics, metadata, targets)
EXCLUDED_COLUMNS = [
    "institution",
    "degree",
    "year",
    "branch",
    "living_arrangement",
    "student_id",
    "data_source",
    "burnout_risk_score",
    "burnout_risk_level",
]

# Targets
TARGET_LEVEL = "burnout_risk_level"
TARGET_SCORE = "burnout_risk_score"

# Classification labels and risk score threshold boundaries
CLASS_LABELS = ["Low", "Moderate", "High", "Critical"]
THRESHOLDS = (30, 50, 70)  # Low < 30, Moderate 30-<50, High 50-<70, Critical >= 70

# Feature Schema: types, allowed ranges, and valid steps
FEATURE_SCHEMA = {
    "study_hours_outside_classes_per_day": {
        "type": float,
        "min": 0.0,
        "max": 12.0,
        "step": 0.5,
        "risk_direction": "higher = more risk",
    },
    "academic_tasks_per_week": {
        "type": int,
        "min": 0,
        "max": 25,
        "step": 1,
        "risk_direction": "higher = more risk",
    },
    "academic_workload": {
        "type": int,
        "min": 1,
        "max": 5,
        "step": 1,
        "risk_direction": "higher = more risk",
    },
    "time_pressure": {
        "type": int,
        "min": 1,
        "max": 5,
        "step": 1,
        "risk_direction": "higher = more risk",
    },
    "avg_sleep_hours": {
        "type": float,
        "min": 3.0,
        "max": 10.0,
        "step": 0.5,
        "risk_direction": "lower = more risk",
    },
    "wakes_up_tired": {
        "type": int,
        "min": 1,
        "max": 5,
        "step": 1,
        "risk_direction": "higher = more risk",
    },
    "physical_activity_days_per_week": {
        "type": int,
        "min": 0,
        "max": 7,
        "step": 1,
        "risk_direction": "lower = more risk",
    },
    "difficulty_concentrating": {
        "type": int,
        "min": 1,
        "max": 5,
        "step": 1,
        "risk_direction": "higher = more risk",
    },
    "academic_emotional_exhaustion": {
        "type": int,
        "min": 1,
        "max": 5,
        "step": 1,
        "risk_direction": "higher = more risk",
    },
}
