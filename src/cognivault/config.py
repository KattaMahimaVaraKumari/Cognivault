"""Configuration constants and schema definitions for Cognivault AI.

Central source of truth for features, target definitions, allowed ranges, validation
constraints, and repository paths.
"""

from pathlib import Path
from typing import Dict, List, Tuple

# Base repository directories
PROJECT_ROOT: Path = Path(__file__).resolve().parent.parent.parent
REPO_ROOT: Path = PROJECT_ROOT
DATA_DIR: Path = REPO_ROOT / "data"
RAW_DATA_PATH: Path = DATA_DIR / "raw" / "cognivault_final_dataset.csv"
PROCESSED_DATA_DIR: Path = DATA_DIR / "processed"
PROCESSED_DATA_PATH: Path = PROCESSED_DATA_DIR / "cognivault_cleaned_dataset.csv"
REPORTS_DIR: Path = REPO_ROOT / "reports"

# Global Reproducibility Seed
SEED: int = 42

# Raw file verification
EXPECTED_RAW_SHA256: str = "b2c24f334cd6cef42265c29659b28291f040ab17ec30278aa175af3d06e2a762"
EXPECTED_ROW_COUNT: int = 2000

# Profile / metadata columns (excluded from model input matrix X)
PROFILE_COLUMNS: List[str] = [
    "institution",
    "degree",
    "year",
    "branch",
    "living_arrangement",
]

# Explicitly excluded columns from model inputs (identifiers, demographics, metadata, targets)
EXCLUDED_COLUMNS: List[str] = [
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

# Exactly nine model features in strict fixed order
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

# Targets
TARGET_SCORE_COLUMN: str = "burnout_risk_score"
TARGET_LEVEL_COLUMN: str = "burnout_risk_level"
TARGET_SCORE: str = TARGET_SCORE_COLUMN
TARGET_LEVEL: str = TARGET_LEVEL_COLUMN
TARGET_COLUMNS: List[str] = [TARGET_SCORE_COLUMN, TARGET_LEVEL_COLUMN]

# Complete raw CSV schema (16 columns)
ALL_RAW_COLUMNS: List[str] = PROFILE_COLUMNS + FEATURE_COLUMNS + TARGET_COLUMNS

# Explicit class ordering
RISK_LEVEL_CLASSES: List[str] = ["Low", "Moderate", "High", "Critical"]
CLASS_LABELS: List[str] = RISK_LEVEL_CLASSES

# Classification labels and risk score threshold boundaries
THRESHOLDS: Tuple[int, int, int] = (30, 50, 70)  # Low < 30, Moderate 30-<50, High 50-<70, Critical >= 70

SCORE_THRESHOLDS: List[Tuple[float, float, str]] = [
    (0.0, 30.0, "Low"),
    (30.0, 50.0, "Moderate"),
    (50.0, 70.0, "High"),
    (70.0, 100.0, "Critical"),
]

# Feature Schema: types, allowed ranges, and valid steps
FEATURE_SCHEMA: Dict[str, Dict] = {
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

# Validation rules for features: (min_val, max_val, is_integer)
FEATURE_VALIDATION_RULES: Dict[str, Dict] = {
    "study_hours_outside_classes_per_day": {
        "min": 0.0,
        "max": 16.0,
        "must_be_integer": False,
        "observed_min": 0.5,
        "observed_max": 7.0,
    },
    "academic_tasks_per_week": {
        "min": 0,
        "max": 50,
        "must_be_integer": True,
        "observed_min": 1,
        "observed_max": 17,
    },
    "academic_workload": {
        "min": 1,
        "max": 5,
        "must_be_integer": True,
        "observed_min": 1,
        "observed_max": 5,
    },
    "time_pressure": {
        "min": 1,
        "max": 5,
        "must_be_integer": True,
        "observed_min": 1,
        "observed_max": 5,
    },
    "avg_sleep_hours": {
        "min": 0.0,
        "max": 24.0,
        "must_be_integer": False,
        "observed_min": 3.5,
        "observed_max": 10.0,
    },
    "wakes_up_tired": {
        "min": 1,
        "max": 5,
        "must_be_integer": True,
        "observed_min": 1,
        "observed_max": 5,
    },
    "physical_activity_days_per_week": {
        "min": 0,
        "max": 7,
        "must_be_integer": True,
        "observed_min": 0,
        "observed_max": 7,
    },
    "difficulty_concentrating": {
        "min": 1,
        "max": 5,
        "must_be_integer": True,
        "observed_min": 1,
        "observed_max": 5,
    },
    "academic_emotional_exhaustion": {
        "min": 1,
        "max": 5,
        "must_be_integer": True,
        "observed_min": 1,
        "observed_max": 5,
    },
}

SCORE_VALIDATION_RULE: Dict = {
    "min": 0.0,
    "max": 100.0,
    "must_be_integer": False,
}
