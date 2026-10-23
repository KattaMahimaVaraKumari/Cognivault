"""Data loading, validation, and auditing module for Cognivault.

Implements strict validation rules, integrity hashing, schema enforcement,
and leakage-free feature extraction. Does NOT silently modify or repair data.
"""

import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd

from cognivault.config import (
    ALL_RAW_COLUMNS,
    EXPECTED_RAW_SHA256,
    FEATURE_COLUMNS,
    FEATURE_VALIDATION_RULES,
    PROFILE_COLUMNS,
    RAW_DATA_PATH,
    RISK_LEVEL_CLASSES,
    SCORE_VALIDATION_RULE,
    TARGET_COLUMNS,
    TARGET_LEVEL_COLUMN,
    TARGET_SCORE_COLUMN,
)


class DataValidationError(ValueError):
    """Raised when dataset validation fails."""
    pass


class SchemaError(DataValidationError):
    """Raised when columns or data types do not conform to schema."""
    pass


class ThresholdMismatchError(DataValidationError):
    """Raised when burnout_risk_level contradicts burnout_risk_score."""
    pass


class LeakageError(DataValidationError):
    """Raised when protected metadata or targets leak into feature matrix."""
    pass


def compute_sha256(file_path: Union[str, Path]) -> str:
    """Computes the SHA-256 hash of a file."""
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")

    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def verify_raw_dataset_hash(
    file_path: Union[str, Path] = RAW_DATA_PATH,
    expected_hash: str = EXPECTED_RAW_SHA256,
) -> bool:
    """Verifies that the raw dataset matches the expected SHA-256 hash."""
    actual_hash = compute_sha256(file_path)
    return actual_hash.lower() == expected_hash.lower()


def expected_level_from_score(score: float) -> str:
    """Maps a continuous burnout risk score to its corresponding risk level."""
    if score < 30.0:
        return "Low"
    elif score < 50.0:
        return "Moderate"
    elif score < 70.0:
        return "High"
    else:
        return "Critical"


def validate_dataframe(df: pd.DataFrame, require_all_raw: bool = True) -> Dict[str, Any]:
    """Strictly validates a Cognivault DataFrame.

    Args:
        df: DataFrame to validate.
        require_all_raw: If True, requires all 16 raw columns. If False, requires
            at least FEATURE_COLUMNS and TARGET_COLUMNS.

    Returns:
        Dictionary of validation results.

    Raises:
        SchemaError: If required columns are missing or nulls are present.
        DataValidationError: If values violate range or integer constraints.
        ThresholdMismatchError: If score and level disagree.
    """
    if df.empty:
        raise DataValidationError("DataFrame is empty.")

    # 1. Column existence
    required_cols = ALL_RAW_COLUMNS if require_all_raw else (FEATURE_COLUMNS + TARGET_COLUMNS)
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise SchemaError(f"Missing required columns: {missing_cols}")

    # 2. Null / NaN check
    null_counts = df[required_cols].isnull().sum()
    cols_with_nulls = null_counts[null_counts > 0].to_dict()
    if cols_with_nulls:
        raise SchemaError(f"Found missing/null values in columns: {cols_with_nulls}")

    # 3. Target Level validation
    if TARGET_LEVEL_COLUMN in df.columns:
        invalid_levels = set(df[TARGET_LEVEL_COLUMN].unique()) - set(RISK_LEVEL_CLASSES)
        if invalid_levels:
            raise DataValidationError(
                f"Invalid categories in {TARGET_LEVEL_COLUMN}: {invalid_levels}. "
                f"Allowed: {RISK_LEVEL_CLASSES}"
            )

    # 4. Target Score validation
    if TARGET_SCORE_COLUMN in df.columns:
        score_min = df[TARGET_SCORE_COLUMN].min()
        score_max = df[TARGET_SCORE_COLUMN].max()
        if (
            score_min < SCORE_VALIDATION_RULE["min"]
            or score_max > SCORE_VALIDATION_RULE["max"]
        ):
            raise DataValidationError(
                f"Target score out of bounds [{SCORE_VALIDATION_RULE['min']}, "
                f"{SCORE_VALIDATION_RULE['max']}]: found [{score_min}, {score_max}]"
            )

    # 5. Score-to-Level Consistency
    if (
        TARGET_SCORE_COLUMN in df.columns
        and TARGET_LEVEL_COLUMN in df.columns
    ):
        expected_levels = df[TARGET_SCORE_COLUMN].apply(expected_level_from_score)
        mismatches = df[expected_levels != df[TARGET_LEVEL_COLUMN]]
        if len(mismatches) > 0:
            mismatch_indices = mismatches.index.tolist()[:5]
            raise ThresholdMismatchError(
                f"Found {len(mismatches)} rows where {TARGET_LEVEL_COLUMN} "
                f"disagrees with {TARGET_SCORE_COLUMN} threshold rules. "
                f"First mismatch row indices: {mismatch_indices}"
            )

    # 6. Feature range and integer constraints
    for feat in FEATURE_COLUMNS:
        rule = FEATURE_VALIDATION_RULES[feat]
        vals = df[feat]

        # Check bounds
        if vals.min() < rule["min"] or vals.max() > rule["max"]:
            raise DataValidationError(
                f"Feature '{feat}' values outside permitted range "
                f"[{rule['min']}, {rule['max']}]: found [{vals.min()}, {vals.max()}]"
            )

        # Check integer constraint
        if rule["must_be_integer"]:
            non_int = vals[vals % 1 != 0]
            if len(non_int) > 0:
                raise DataValidationError(
                    f"Feature '{feat}' requires integer values, but found "
                    f"{len(non_int)} non-integer values (e.g. {non_int.iloc[0]})."
                )

    return {
        "status": "VALID",
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns),
    }


def load_raw_data(
    file_path: Union[str, Path] = RAW_DATA_PATH,
    verify_hash: bool = True,
) -> pd.DataFrame:
    """Loads and validates the raw CSV dataset.

    Args:
        file_path: Path to the raw CSV file.
        verify_hash: Whether to verify the SHA-256 hash matches EXPECTED_RAW_SHA256.

    Returns:
        Validated pandas DataFrame.

    Raises:
        FileNotFoundError: If the CSV file does not exist.
        DataValidationError: If the hash or content validation fails.
    """
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Raw dataset file not found at: {path}")

    if verify_hash:
        actual_hash = compute_sha256(path)
        if actual_hash.lower() != EXPECTED_RAW_SHA256.lower():
            raise DataValidationError(
                f"Raw dataset SHA-256 hash mismatch! "
                f"Expected: {EXPECTED_RAW_SHA256}, Got: {actual_hash}"
            )

    df = pd.read_csv(path)
    validate_dataframe(df, require_all_raw=True)
    return df


def get_feature_matrix_and_targets(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    """Extracts strictly the 9 feature columns and targets from DataFrame.

    Guarantees no leakage of metadata/profile columns, IDs, or targets into X.

    Args:
        df: Validated DataFrame containing features and targets.

    Returns:
        Tuple of (X, y_level, y_score):
        - X: DataFrame containing exactly FEATURE_COLUMNS in specified order.
        - y_level: Series of categorical burnout_risk_level.
        - y_score: Series of numeric burnout_risk_score.

    Raises:
        LeakageError: If any profile or target column is present in X.
        SchemaError: If any required feature or target is missing.
    """
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            raise SchemaError(f"Feature column '{col}' missing from DataFrame.")

    if TARGET_LEVEL_COLUMN not in df.columns:
        raise SchemaError(f"Target column '{TARGET_LEVEL_COLUMN}' missing from DataFrame.")

    if TARGET_SCORE_COLUMN not in df.columns:
        raise SchemaError(f"Target column '{TARGET_SCORE_COLUMN}' missing from DataFrame.")

    # Strict slice and order
    X = df[FEATURE_COLUMNS].copy()

    # Leakage assertion: check that no profile or target columns exist in X
    leakage_cols = set(X.columns).intersection(set(PROFILE_COLUMNS + TARGET_COLUMNS))
    if leakage_cols:
        raise LeakageError(f"Leakage detected: {leakage_cols} found in feature matrix X.")

    if list(X.columns) != FEATURE_COLUMNS:
        raise SchemaError(
            f"Feature matrix columns do not match exact ordered specification. "
            f"Expected: {FEATURE_COLUMNS}, Got: {list(X.columns)}"
        )

    y_level = df[TARGET_LEVEL_COLUMN].copy()
    y_score = df[TARGET_SCORE_COLUMN].copy()

    return X, y_level, y_score


def audit_dataset(file_path: Union[str, Path] = RAW_DATA_PATH) -> Dict[str, Any]:
    """Performs an exhaustive audit of the raw dataset without modifying it.

    Returns:
        Audit report dictionary with exact measurements.
    """
    path = Path(file_path)
    file_hash = compute_sha256(path)
    df = pd.read_csv(path)

    # Missing values
    missing_counts = df.isnull().sum().to_dict()

    # Duplicates
    exact_duplicates = int(df.duplicated().sum())
    feature_duplicates = int(df.duplicated(subset=FEATURE_COLUMNS).sum())

    # Profile distributions
    profiles = {}
    for col in PROFILE_COLUMNS:
        if col in df.columns:
            profiles[col] = df[col].value_counts(dropna=False).to_dict()

    # Feature statistics & precision
    feature_stats = {}
    for col in FEATURE_COLUMNS:
        vals = df[col]
        # Decimal places
        dec_places = vals.apply(
            lambda x: len(str(x).split(".")[1])
            if "." in str(x) and str(x).split(".")[1] != "0"
            else 0
        )
        feature_stats[col] = {
            "dtype": str(vals.dtype),
            "min": float(vals.min()),
            "max": float(vals.max()),
            "unique_count": int(vals.nunique()),
            "max_decimal_places": int(dec_places.max()),
            "unique_values_sorted": sorted(vals.unique().tolist())
            if vals.nunique() <= 20
            else None,
        }

    # Score statistics
    score_vals = df[TARGET_SCORE_COLUMN]
    score_dec_places = score_vals.apply(
        lambda x: len(str(x).split(".")[1])
        if "." in str(x) and str(x).split(".")[1] != "0"
        else 0
    )
    score_stats = {
        "dtype": str(score_vals.dtype),
        "min": float(score_vals.min()),
        "max": float(score_vals.max()),
        "mean": float(score_vals.mean()),
        "std": float(score_vals.std()),
        "unique_count": int(score_vals.nunique()),
        "max_decimal_places": int(score_dec_places.max()),
    }

    # Target class distributions
    level_counts = df[TARGET_LEVEL_COLUMN].value_counts().to_dict()
    level_pcts = (
        (df[TARGET_LEVEL_COLUMN].value_counts(normalize=True) * 100)
        .round(2)
        .to_dict()
    )

    # Threshold consistency
    expected_levels = df[TARGET_SCORE_COLUMN].apply(expected_level_from_score)
    mismatches = df[expected_levels != df[TARGET_LEVEL_COLUMN]]

    return {
        "sha256": file_hash,
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_counts": missing_counts,
        "exact_duplicates": exact_duplicates,
        "feature_duplicates": feature_duplicates,
        "profiles": profiles,
        "feature_stats": feature_stats,
        "score_stats": score_stats,
        "target_level_counts": level_counts,
        "target_level_percentages": level_pcts,
        "threshold_mismatches_count": len(mismatches),
    }
