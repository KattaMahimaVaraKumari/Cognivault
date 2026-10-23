"""Focused tests for feature preparation and dataset cleaning in Cognivault AI."""

import hashlib
import sys
from pathlib import Path
import pytest
import pandas as pd

# Add src to sys.path
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from cognivault.config import (
    EXCLUDED_COLUMNS,
    FEATURE_COLUMNS,
    RAW_DATA_PATH,
    PROCESSED_DATA_PATH,
    TARGET_LEVEL,
    TARGET_SCORE,
)
from cognivault.features import (
    clean_unspecified_institution,
    split_xy,
    validate_features,
)


@pytest.fixture
def sample_valid_df():
    """Create a minimal valid synthetic DataFrame matching the expected schema."""
    return pd.DataFrame({
        "student_id": [101, 102, 103],
        "data_source": ["synthetic", "synthetic", "synthetic"],
        "institution": ["IIIT Pune", "JNTUH", "IIIT Pune"],
        "degree": ["B.Tech", "B.Tech", "M.Tech"],
        "year": [3, 2, 1],
        "branch": ["CSE", "ECE", "CSE"],
        "living_arrangement": ["Hostel", "Day Scholar", "PG/Other"],
        "study_hours_outside_classes_per_day": [3.5, 4.0, 2.0],
        "academic_tasks_per_week": [8, 10, 5],
        "academic_workload": [4, 3, 2],
        "time_pressure": [4, 3, 2],
        "avg_sleep_hours": [6.0, 7.0, 8.0],
        "wakes_up_tired": [4, 2, 1],
        "physical_activity_days_per_week": [2, 4, 5],
        "difficulty_concentrating": [3, 2, 1],
        "academic_emotional_exhaustion": [4, 2, 1],
        "burnout_risk_score": [58.5, 34.2, 18.0],
        "burnout_risk_level": ["High", "Moderate", "Low"],
        "hci_extra_col": ["dark_mode", "light_mode", "system"],
    })


def test_feature_count_and_order(sample_valid_df):
    """Test that split_xy returns exactly nine features in the exact designated order."""
    X, y = split_xy(sample_valid_df, target=TARGET_LEVEL)

    assert X.shape[1] == 9, f"Expected 9 features, got {X.shape[1]}"
    assert list(X.columns) == FEATURE_COLUMNS, (
        f"Feature columns order mismatch.\n"
        f"Actual:   {list(X.columns)}\n"
        f"Expected: {FEATURE_COLUMNS}"
    )


def test_split_xy_separation(sample_valid_df):
    """Test correct separation of X from classification and regression targets."""
    # Classification target separation
    X_clf, y_clf = split_xy(sample_valid_df, target=TARGET_LEVEL)
    assert isinstance(X_clf, pd.DataFrame)
    assert isinstance(y_clf, pd.Series)
    assert y_clf.name == TARGET_LEVEL
    assert y_clf.tolist() == ["High", "Moderate", "Low"]
    assert TARGET_LEVEL not in X_clf.columns
    assert TARGET_SCORE not in X_clf.columns

    # Regression target separation
    X_reg, y_reg = split_xy(sample_valid_df, target=TARGET_SCORE)
    assert isinstance(X_reg, pd.DataFrame)
    assert isinstance(y_reg, pd.Series)
    assert y_reg.name == TARGET_SCORE
    assert y_reg.tolist() == [58.5, 34.2, 18.0]
    assert TARGET_SCORE not in X_reg.columns
    assert TARGET_LEVEL not in X_reg.columns

    # Dual target separation
    X_both, y_l, y_s = split_xy(sample_valid_df, target="both")
    assert y_l.name == TARGET_LEVEL
    assert y_s.name == TARGET_SCORE

    # Ensure feature values are exactly preserved (no clipping, altering, or dropping)
    pd.testing.assert_frame_equal(X_clf, sample_valid_df[FEATURE_COLUMNS])


def test_exclusion_of_forbidden_fields(sample_valid_df):
    """Test that no metadata, demographic profile fields, IDs, or targets enter X."""
    X, _ = split_xy(sample_valid_df, target=TARGET_LEVEL)

    for excluded_col in EXCLUDED_COLUMNS:
        assert excluded_col not in X.columns, f"Excluded column '{excluded_col}' leaked into X!"

    # Ensure other metadata columns (e.g. HCI columns) are also excluded
    assert "hci_extra_col" not in X.columns


def test_clear_errors_when_required_columns_missing(sample_valid_df):
    """Test that clear errors are raised when required columns are missing."""
    # Missing a required feature
    df_missing_feat = sample_valid_df.drop(columns=["academic_emotional_exhaustion"])
    with pytest.raises(ValueError, match="Missing required feature column"):
        split_xy(df_missing_feat, target=TARGET_LEVEL)

    # Missing target column
    df_missing_target = sample_valid_df.drop(columns=[TARGET_LEVEL])
    with pytest.raises(ValueError, match="Requested target column 'burnout_risk_level' not found"):
        split_xy(df_missing_target, target=TARGET_LEVEL)

    # Invalid input type
    with pytest.raises(TypeError, match="Expected pandas DataFrame"):
        split_xy([1, 2, 3], target=TARGET_LEVEL)


def test_clean_unspecified_institution_removes_rows_properly():
    """Test removal of 'Unspecified' institution rows regardless of case or whitespace."""
    test_df = pd.DataFrame({
        "institution": [
            "IIIT Pune",
            "Unspecified",
            "unspecified",
            "  UNSPECIFIED  ",
            "JNTUH",
            " IIIT Pune ",
        ],
        "study_hours_outside_classes_per_day": [3.0, 2.0, 4.0, 1.0, 5.0, 2.5],
        "burnout_risk_level": ["Moderate", "Low", "High", "Critical", "Moderate", "Low"],
    })

    cleaned = clean_unspecified_institution(test_df)

    # Original dataframe must not be modified
    assert len(test_df) == 6

    # 3 unspecified rows removed, 3 valid rows remaining
    assert len(cleaned) == 3
    remaining_institutions = cleaned["institution"].tolist()
    assert remaining_institutions == ["IIIT Pune", "JNTUH", " IIIT Pune "]


def test_clean_unspecified_institution_missing_column_error():
    """Test that missing institution column raises a clear ValueError."""
    df_no_inst = pd.DataFrame({"some_col": [1, 2, 3]})
    with pytest.raises(ValueError, match="Required institution column 'institution' not found"):
        clean_unspecified_institution(df_no_inst)


def test_real_dataset_cleaning_and_preservation():
    """Verify cleaning on the actual project dataset and ensure raw file is byte-preserved."""
    assert RAW_DATA_PATH.exists(), f"Raw dataset not found at {RAW_DATA_PATH}"

    # Calculate SHA256 of raw dataset before test
    with open(RAW_DATA_PATH, "rb") as f:
        raw_hash_before = hashlib.sha256(f.read()).hexdigest()

    df_raw = pd.read_csv(RAW_DATA_PATH)
    assert len(df_raw) == 2000, f"Expected 2000 raw rows, got {len(df_raw)}"

    # Clean dataset
    df_clean = clean_unspecified_institution(df_raw)

    # Verify counts
    assert len(df_clean) == 1900, f"Expected 1900 cleaned rows, got {len(df_clean)}"
    assert (df_raw["institution"].str.strip().str.lower() == "unspecified").sum() == 100

    # Verify class counts after cleaning
    expected_cleaned_counts = {
        "Moderate": 687,
        "High": 553,
        "Low": 455,
        "Critical": 205,
    }
    actual_cleaned_counts = df_clean["burnout_risk_level"].value_counts().to_dict()
    assert actual_cleaned_counts == expected_cleaned_counts, (
        f"Cleaned class counts mismatch: {actual_cleaned_counts} vs {expected_cleaned_counts}"
    )

    # Verify that split_xy works cleanly on the cleaned dataset
    X, y = split_xy(df_clean, target=TARGET_LEVEL)
    assert X.shape == (1900, 9)
    assert len(y) == 1900
    assert list(X.columns) == FEATURE_COLUMNS

    # Calculate SHA256 of raw dataset after test to prove it was never overwritten or modified
    with open(RAW_DATA_PATH, "rb") as f:
        raw_hash_after = hashlib.sha256(f.read()).hexdigest()

    assert raw_hash_before == raw_hash_after, "CRITICAL ERROR: Original raw dataset was altered!"
