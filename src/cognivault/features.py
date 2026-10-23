"""Feature preparation and dataset cleaning for Cognivault AI.

Provides functions to clean raw institution entries, strictly separate the 9 model input
features from targets without leakage, and validate feature shapes and schemas.
"""

from typing import List, Optional, Tuple, Union
import pandas as pd

try:
    from cognivault.config import (
        EXCLUDED_COLUMNS,
        FEATURE_COLUMNS,
        FEATURE_SCHEMA,
        TARGET_LEVEL,
        TARGET_SCORE,
    )
except ImportError:
    # Fallback to direct imports if run as a standalone script
    from config import (
        EXCLUDED_COLUMNS,
        FEATURE_COLUMNS,
        FEATURE_SCHEMA,
        TARGET_LEVEL,
        TARGET_SCORE,
    )


def clean_unspecified_institution(
    df: pd.DataFrame,
    institution_col: str = "institution",
) -> pd.DataFrame:
    """
    Remove records where the institution value is 'Unspecified'.

    Performs case-insensitive matching and trims leading/trailing whitespace.
    Does not modify the original DataFrame in-place.

    Parameters
    ----------
    df : pd.DataFrame
        Input DataFrame containing raw data.
    institution_col : str, default="institution"
        The column name representing the student's institution.

    Returns
    -------
    pd.DataFrame
        A new DataFrame with 'Unspecified' institution rows removed.

    Raises
    ------
    ValueError
        If the specified institution column is not present in df.
    """
    if not isinstance(df, pd.DataFrame):
        raise TypeError(f"Expected pandas DataFrame, got {type(df).__name__}")

    if institution_col not in df.columns:
        raise ValueError(
            f"Required institution column '{institution_col}' not found in dataset. "
            f"Available columns: {list(df.columns)}"
        )

    # Normalize values: trim whitespace and lowercase for robust comparison
    normalized = df[institution_col].astype(str).str.strip().str.lower()
    unspecified_mask = normalized == "unspecified"

    # Return filtered copy without altering original dataframe
    cleaned_df = df.loc[~unspecified_mask].copy().reset_index(drop=True)
    return cleaned_df


def split_xy(
    df: pd.DataFrame,
    target: Optional[Union[str, Tuple[str, ...]]] = TARGET_LEVEL,
) -> Union[Tuple[pd.DataFrame, pd.Series], Tuple[pd.DataFrame, pd.Series, pd.Series]]:
    """
    Separate the nine model input features from the requested target.

    Validates that all required feature columns exist, returns them in the exact specified
    order, and strictly ensures that no identifiers, demographic profile fields, metadata,
    or target variables enter the feature matrix X.

    Does not drop, impute, clip, or alter any feature values.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame containing features and target columns.
    target : str, tuple of str, or None, default='burnout_risk_level'
        The target column to extract.
        - 'burnout_risk_level': returns (X, y_level)
        - 'burnout_risk_score': returns (X, y_score)
        - None or ('burnout_risk_level', 'burnout_risk_score'): returns (X, y_level, y_score)

    Returns
    -------
    (X, y) or (X, y_level, y_score)
        X: pd.DataFrame with exactly the 9 input features in the designated order.
        y: pd.Series containing the target.

    Raises
    ------
    TypeError
        If df is not a pandas DataFrame.
    ValueError
        If required feature columns or requested target columns are missing,
        or if any excluded column is detected in X.
    """
    if not isinstance(df, pd.DataFrame):
        raise TypeError(f"Expected pandas DataFrame, got {type(df).__name__}")

    # Check for missing required input features
    missing_features = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_features:
        raise ValueError(
            f"Missing required feature column(s): {missing_features}. "
            f"Expected the 9 features: {FEATURE_COLUMNS}"
        )

    # Handle target specification and verification
    valid_targets = {TARGET_LEVEL, TARGET_SCORE}
    extract_both = False

    if target is None or target == "both" or target == (TARGET_LEVEL, TARGET_SCORE):
        extract_both = True
        missing_targets = [t for t in (TARGET_LEVEL, TARGET_SCORE) if t not in df.columns]
        if missing_targets:
            raise ValueError(f"Missing required target column(s): {missing_targets}")
    elif isinstance(target, str):
        if target not in df.columns:
            raise ValueError(
                f"Requested target column '{target}' not found in dataset. "
                f"Available columns: {list(df.columns)}"
            )
        if target not in valid_targets:
            raise ValueError(
                f"Invalid target '{target}'. Allowed targets are {valid_targets} or None/'both'."
            )
    else:
        raise ValueError(f"Unsupported target specification: {target}")

    # Select exactly the 9 features in the exact specified order
    X = df[FEATURE_COLUMNS].copy()

    # Integrity verification: verify feature count and exact column order
    if len(X.columns) != 9:
        raise ValueError(f"Expected exactly 9 features in X, found {len(X.columns)}")
    if list(X.columns) != FEATURE_COLUMNS:
        raise ValueError(
            f"Feature columns in X do not match required order.\n"
            f"Actual:   {list(X.columns)}\n"
            f"Expected: {FEATURE_COLUMNS}"
        )

    # Anti-leakage verification: ensure no excluded column or metadata enters X
    for col in EXCLUDED_COLUMNS:
        if col in X.columns:
            raise ValueError(
                f"Data leakage detected! Excluded column '{col}' is present in model inputs X."
            )

    # Verify that feature values have not been modified or clipped
    if not X.equals(df[FEATURE_COLUMNS]):
        raise ValueError("Feature values in X do not match original DataFrame values.")

    if extract_both:
        y_level = df[TARGET_LEVEL].copy()
        y_score = df[TARGET_SCORE].copy()
        return X, y_level, y_score

    y = df[target].copy()
    return X, y


def validate_features(df: pd.DataFrame) -> None:
    """
    Validate that a DataFrame contains the exact 9 features with valid ranges and types.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame or row to validate.

    Raises
    ------
    ValueError
        If columns, ordering, missing values, or value ranges are invalid.
    """
    if not isinstance(df, pd.DataFrame):
        raise TypeError(f"Expected pandas DataFrame, got {type(df).__name__}")

    if list(df.columns) != FEATURE_COLUMNS:
        raise ValueError(
            f"Columns must match exact 9 FEATURE_COLUMNS in order.\n"
            f"Got:      {list(df.columns)}\n"
            f"Expected: {FEATURE_COLUMNS}"
        )

    # Check missing values
    null_counts = df.isnull().sum()
    if null_counts.any():
        offending = null_counts[null_counts > 0].to_dict()
        raise ValueError(f"Missing values detected in features: {offending}")

    # Validate range constraints based on FEATURE_SCHEMA
    for col, spec in FEATURE_SCHEMA.items():
        min_val = spec["min"]
        max_val = spec["max"]
        col_series = df[col]
        out_of_bounds = df[(col_series < min_val) | (col_series > max_val)]
        if not out_of_bounds.empty:
            sample_bad = out_of_bounds[col].iloc[0]
            raise ValueError(
                f"Feature '{col}' has value {sample_bad} outside allowed range [{min_val}, {max_val}]."
            )
