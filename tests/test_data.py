"""Tests for dataset loading, validation, leakage prevention, and schema enforcement."""

import copy
import pandas as pd
import pytest

from cognivault.config import (
    ALL_RAW_COLUMNS,
    EXPECTED_RAW_SHA256,
    EXPECTED_ROW_COUNT,
    FEATURE_COLUMNS,
    PROFILE_COLUMNS,
    RAW_DATA_PATH,
    RISK_LEVEL_CLASSES,
    TARGET_COLUMNS,
    TARGET_LEVEL_COLUMN,
    TARGET_SCORE_COLUMN,
)
from cognivault.data import (
    DataValidationError,
    LeakageError,
    SchemaError,
    ThresholdMismatchError,
    audit_dataset,
    compute_sha256,
    expected_level_from_score,
    get_feature_matrix_and_targets,
    load_raw_data,
    validate_dataframe,
    verify_raw_dataset_hash,
)


@pytest.fixture
def raw_df():
    """Loads a fresh copy of the raw dataset."""
    return pd.read_csv(RAW_DATA_PATH)


def test_raw_csv_exists_and_hash():
    """Verify raw CSV file exists and matches the exact expected SHA-256."""
    assert RAW_DATA_PATH.is_file(), f"File does not exist: {RAW_DATA_PATH}"
    actual_hash = compute_sha256(RAW_DATA_PATH)
    assert actual_hash.lower() == EXPECTED_RAW_SHA256.lower(), (
        f"Hash mismatch: expected {EXPECTED_RAW_SHA256}, got {actual_hash}"
    )
    assert verify_raw_dataset_hash() is True


def test_load_raw_data_success():
    """Verify loading raw data succeeds with expected shape."""
    df = load_raw_data(RAW_DATA_PATH, verify_hash=True)
    assert df.shape == (EXPECTED_ROW_COUNT, len(ALL_RAW_COLUMNS))
    assert list(df.columns) == ALL_RAW_COLUMNS


def test_load_raw_data_hash_mismatch_raises(tmp_path):
    """Verify loader raises DataValidationError if file hash does not match."""
    tampered_file = tmp_path / "tampered.csv"
    tampered_file.write_text("some,dummy,data\n1,2,3")
    with pytest.raises(DataValidationError, match="SHA-256 hash mismatch"):
        load_raw_data(tampered_file, verify_hash=True)


def test_validate_dataframe_missing_column(raw_df):
    """Verify SchemaError is raised if any required column is missing."""
    df_missing = raw_df.drop(columns=["academic_workload"])
    with pytest.raises(SchemaError, match="Missing required columns"):
        validate_dataframe(df_missing)


def test_validate_dataframe_missing_profile_column(raw_df):
    """Verify SchemaError is raised if a profile column is missing when require_all_raw=True."""
    df_missing = raw_df.drop(columns=["institution"])
    with pytest.raises(SchemaError, match="Missing required columns"):
        validate_dataframe(df_missing, require_all_raw=True)


def test_validate_dataframe_null_values(raw_df):
    """Verify SchemaError is raised if null/NaN values are encountered."""
    df_null = raw_df.copy()
    df_null.loc[0, "avg_sleep_hours"] = None
    with pytest.raises(SchemaError, match="Found missing/null values"):
        validate_dataframe(df_null)


def test_validate_dataframe_invalid_labels(raw_df):
    """Verify DataValidationError is raised if risk level contains unknown labels."""
    df_invalid = raw_df.copy()
    df_invalid.loc[0, TARGET_LEVEL_COLUMN] = "Extreme"
    with pytest.raises(DataValidationError, match="Invalid categories"):
        validate_dataframe(df_invalid)


def test_validate_dataframe_out_of_range_features(raw_df):
    """Verify DataValidationError is raised for out-of-range feature values."""
    # Likert out of range (> 5)
    df_high = raw_df.copy()
    df_high.loc[0, "academic_workload"] = 6
    with pytest.raises(DataValidationError, match="outside permitted range"):
        validate_dataframe(df_high)

    # Physical activity days out of range (> 7)
    df_act = raw_df.copy()
    df_act.loc[0, "physical_activity_days_per_week"] = 8
    with pytest.raises(DataValidationError, match="outside permitted range"):
        validate_dataframe(df_act)

    # Negative value
    df_neg = raw_df.copy()
    df_neg.loc[0, "time_pressure"] = 0
    with pytest.raises(DataValidationError, match="outside permitted range"):
        validate_dataframe(df_neg)


def test_validate_dataframe_non_integer_on_integer_features(raw_df):
    """Verify DataValidationError is raised when integer fields have float values."""
    df_float = raw_df.copy()
    df_float["academic_workload"] = df_float["academic_workload"].astype(float)
    df_float.loc[0, "academic_workload"] = 3.5
    with pytest.raises(DataValidationError, match="requires integer values"):
        validate_dataframe(df_float)


def test_validate_dataframe_score_out_of_bounds(raw_df):
    """Verify DataValidationError is raised if score is < 0 or > 100."""
    df_score = raw_df.copy()
    df_score.loc[0, TARGET_SCORE_COLUMN] = 105.0
    with pytest.raises(DataValidationError, match="Target score out of bounds"):
        validate_dataframe(df_score)


def test_validate_dataframe_score_level_mismatch(raw_df):
    """Verify ThresholdMismatchError is raised when score and label disagree."""
    df_mismatch = raw_df.copy()
    # Row 0 has High level; change score to 20.0 (Low range) without changing level
    df_mismatch.loc[0, TARGET_SCORE_COLUMN] = 20.0
    df_mismatch.loc[0, TARGET_LEVEL_COLUMN] = "High"
    with pytest.raises(ThresholdMismatchError, match="disagrees with burnout_risk_score"):
        validate_dataframe(df_mismatch)


def test_get_feature_matrix_and_targets_exclusion(raw_df):
    """Verify X contains strictly the 9 features in order, and zero profile/targets."""
    X, y_level, y_score = get_feature_matrix_and_targets(raw_df)

    # X shape and columns
    assert X.shape == (2000, 9)
    assert list(X.columns) == FEATURE_COLUMNS

    # Ensure no profile columns in X
    for col in PROFILE_COLUMNS:
        assert col not in X.columns

    # Ensure targets not in X
    for col in TARGET_COLUMNS:
        assert col not in X.columns

    # Verify targets series
    assert len(y_level) == 2000
    assert len(y_score) == 2000
    assert y_level.name == TARGET_LEVEL_COLUMN
    assert y_score.name == TARGET_SCORE_COLUMN


def test_get_feature_matrix_leakage_detection(raw_df):
    """Verify LeakageError is raised if a profile column is disguised into X."""
    df_leaked = raw_df.copy()
    # Replace one feature with institution
    df_leaked["study_hours_outside_classes_per_day"] = df_leaked["institution"]
    # If config or caller tries to include profile columns:
    from unittest.mock import patch
    with patch("cognivault.data.FEATURE_COLUMNS", ["institution"] + FEATURE_COLUMNS[1:]):
        with pytest.raises(LeakageError, match="Leakage detected"):
            get_feature_matrix_and_targets(df_leaked)


def test_actual_data_threshold_consistency(raw_df):
    """Verify every single row in the actual raw dataset obeys threshold rules."""
    expected = raw_df[TARGET_SCORE_COLUMN].apply(expected_level_from_score)
    mismatches = raw_df[expected != raw_df[TARGET_LEVEL_COLUMN]]
    assert len(mismatches) == 0, f"Found {len(mismatches)} threshold mismatches in raw data!"


def test_audit_dataset_completeness():
    """Verify audit_dataset returns valid structure and accurate counts."""
    audit = audit_dataset(RAW_DATA_PATH)
    assert audit["sha256"] == EXPECTED_RAW_SHA256
    assert audit["row_count"] == 2000
    assert audit["column_count"] == 16
    assert audit["exact_duplicates"] == 0
    assert audit["feature_duplicates"] == 0
    assert audit["threshold_mismatches_count"] == 0
    assert sum(audit["missing_counts"].values()) == 0
