"""Dataset splitting and cross-validation manifest generator for Cognivault.

Ensures strict reproducibility, stratification, and zero data leakage across
training and held-out test sets, as well as 5-fold cross-validation folds.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split

from cognivault.config import (
    DATA_DIR,
    EXPECTED_RAW_SHA256,
    FEATURE_COLUMNS,
    PROFILE_COLUMNS,
    RAW_DATA_PATH,
    TARGET_COLUMNS,
    TARGET_LEVEL_COLUMN,
    TARGET_SCORE_COLUMN,
)
from cognivault.data import (
    DataValidationError,
    LeakageError,
    SchemaError,
    compute_sha256,
    get_feature_matrix_and_targets,
    load_raw_data,
)

INTERIM_DATA_DIR: Path = DATA_DIR / "interim"
SPLIT_MANIFEST_PATH: Path = INTERIM_DATA_DIR / "split_indices.json"

DEFAULT_RANDOM_STATE: int = 42
DEFAULT_TEST_SIZE: float = 0.20
DEFAULT_N_SPLITS: int = 5


def create_split_manifest(
    df: Optional[pd.DataFrame] = None,
    random_state: int = DEFAULT_RANDOM_STATE,
    test_size: float = DEFAULT_TEST_SIZE,
    n_splits: int = DEFAULT_N_SPLITS,
    raw_data_path: Path = RAW_DATA_PATH,
) -> Dict[str, Any]:
    """Generates stratified train/test split and 5-fold CV splits on train set.

    Args:
        df: Optional preloaded DataFrame. If None, loads from raw_data_path.
        random_state: Random state for reproducibility (default 42).
        test_size: Ratio of held-out test split (default 0.20).
        n_splits: Number of cross-validation folds on train set (default 5).
        raw_data_path: Path to the raw CSV.

    Returns:
        Manifest dictionary with indices, metadata, and fold definitions.
    """
    if df is None:
        df = load_raw_data(raw_data_path, verify_hash=True)

    dataset_hash = compute_sha256(raw_data_path)
    total_rows = len(df)

    if TARGET_LEVEL_COLUMN not in df.columns:
        raise SchemaError(f"Target column '{TARGET_LEVEL_COLUMN}' missing from dataset.")

    # 1. Stratified 80/20 train/test split on burnout_risk_level
    indices = df.index.values
    y_level = df[TARGET_LEVEL_COLUMN].values

    train_idx, test_idx = train_test_split(
        indices,
        test_size=test_size,
        stratify=y_level,
        random_state=random_state,
    )

    # Sort indices for clean reproducibility
    train_idx = sorted([int(i) for i in train_idx])
    test_idx = sorted([int(i) for i in test_idx])

    # Disjointness check
    overlap = set(train_idx).intersection(set(test_idx))
    if overlap:
        raise DataValidationError(f"Split indices overlap! Overlapping indices: {overlap}")

    # 2. Stratified 5-Fold Cross-Validation on TRAIN set only
    train_y_level = df.loc[train_idx, TARGET_LEVEL_COLUMN].values
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)

    cv_folds: List[Dict[str, Any]] = []
    for fold_num, (f_train_pos, f_val_pos) in enumerate(skf.split(train_idx, train_y_level)):
        # Global row indices in original DataFrame
        fold_train_global = [int(train_idx[p]) for p in f_train_pos]
        fold_val_global = [int(train_idx[p]) for p in f_val_pos]

        # Positional indices within train_idx (range 0 to len(train_idx)-1)
        fold_train_pos_list = [int(p) for p in f_train_pos]
        fold_val_pos_list = [int(p) for p in f_val_pos]

        cv_folds.append({
            "fold": fold_num,
            "train_indices_global": fold_train_global,
            "val_indices_global": fold_val_global,
            "train_indices_positional": fold_train_pos_list,
            "val_indices_positional": fold_val_pos_list,
            "train_count": len(fold_train_global),
            "val_count": len(fold_val_global),
        })

    # Class distributions
    class_dist_full = df[TARGET_LEVEL_COLUMN].value_counts().to_dict()
    class_dist_train = df.loc[train_idx, TARGET_LEVEL_COLUMN].value_counts().to_dict()
    class_dist_test = df.loc[test_idx, TARGET_LEVEL_COLUMN].value_counts().to_dict()

    class_pct_full = (df[TARGET_LEVEL_COLUMN].value_counts(normalize=True) * 100).round(2).to_dict()
    class_pct_train = (df.loc[train_idx, TARGET_LEVEL_COLUMN].value_counts(normalize=True) * 100).round(2).to_dict()
    class_pct_test = (df.loc[test_idx, TARGET_LEVEL_COLUMN].value_counts(normalize=True) * 100).round(2).to_dict()

    manifest: Dict[str, Any] = {
        "dataset_name": Path(raw_data_path).name,
        "dataset_sha256": dataset_hash,
        "total_rows": total_rows,
        "random_state": random_state,
        "stratify_column": TARGET_LEVEL_COLUMN,
        "test_size_ratio": test_size,
        "train_size": len(train_idx),
        "test_size": len(test_idx),
        "n_cv_folds": n_splits,
        "train_indices": train_idx,
        "test_indices": test_idx,
        "cv_folds": cv_folds,
        "class_counts": {
            "full": class_dist_full,
            "train": class_dist_train,
            "test": class_dist_test,
        },
        "class_percentages": {
            "full": class_pct_full,
            "train": class_pct_train,
            "test": class_pct_test,
        },
    }

    return manifest


def save_split_manifest(
    manifest: Dict[str, Any],
    output_path: Path = SPLIT_MANIFEST_PATH,
) -> Path:
    """Saves the split manifest to JSON.

    Args:
        manifest: Manifest dictionary.
        output_path: Destination JSON path.

    Returns:
        Path of saved file.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return output_path


def load_split_manifest(
    manifest_path: Path = SPLIT_MANIFEST_PATH,
    verify_against_dataset: bool = True,
    raw_data_path: Path = RAW_DATA_PATH,
) -> Dict[str, Any]:
    """Loads and validates an existing split manifest.

    Args:
        manifest_path: Path to split_indices.json.
        verify_against_dataset: Whether to verify dataset SHA-256 against manifest.
        raw_data_path: Path to raw dataset.

    Returns:
        Validated manifest dictionary.

    Raises:
        FileNotFoundError: If manifest file does not exist.
        DataValidationError: If manifest contents are invalid or corrupted.
    """
    path = Path(manifest_path)
    if not path.is_file():
        raise FileNotFoundError(f"Split manifest not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # Validate essential keys
    required_keys = [
        "dataset_sha256",
        "total_rows",
        "random_state",
        "train_size",
        "test_size",
        "n_cv_folds",
        "train_indices",
        "test_indices",
        "cv_folds",
    ]
    for key in required_keys:
        if key not in manifest:
            raise SchemaError(f"Missing key in split manifest: '{key}'")

    train_idx = set(manifest["train_indices"])
    test_idx = set(manifest["test_indices"])

    # Disjointness check
    overlap = train_idx.intersection(test_idx)
    if overlap:
        raise DataValidationError(f"Manifest train and test indices overlap: {overlap}")

    # Completeness check
    total = len(train_idx) + len(test_idx)
    if total != manifest["total_rows"]:
        raise DataValidationError(
            f"Train ({len(train_idx)}) + Test ({len(test_idx)}) count "
            f"does not equal total rows ({manifest['total_rows']})."
        )

    # CV Folds integrity
    folds = manifest["cv_folds"]
    if len(folds) != manifest["n_cv_folds"]:
        raise DataValidationError(
            f"Expected {manifest['n_cv_folds']} CV folds, found {len(folds)}."
        )

    val_indices_collected = set()
    for fold in folds:
        f_train = set(fold["train_indices_global"])
        f_val = set(fold["val_indices_global"])
        if f_train.intersection(f_val):
            raise DataValidationError(
                f"Fold {fold['fold']} train and validation indices overlap!"
            )
        if not f_train.issubset(train_idx) or not f_val.issubset(train_idx):
            raise DataValidationError(
                f"Fold {fold['fold']} contains indices outside training set!"
            )
        val_indices_collected.update(f_val)

    if val_indices_collected != train_idx:
        raise DataValidationError(
            "Union of CV fold validation sets does not exactly equal the training set!"
        )

    # Hash verification
    if verify_against_dataset:
        actual_hash = compute_sha256(raw_data_path)
        if actual_hash.lower() != manifest["dataset_sha256"].lower():
            raise DataValidationError(
                f"Dataset hash mismatch with manifest! "
                f"Manifest expects: {manifest['dataset_sha256']}, Actual: {actual_hash}"
            )

    return manifest


def get_split_data(
    df: Optional[pd.DataFrame] = None,
    manifest_path: Path = SPLIT_MANIFEST_PATH,
    raw_data_path: Path = RAW_DATA_PATH,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series, pd.Series]:
    """Retrieves strictly partitioned train/test splits for modeling.

    Guarantees:
    - Exactly FEATURE_COLUMNS in X_train and X_test in identical specified order.
    - Zero profile/metadata columns or target columns in X_train or X_test.
    - Zero index overlap between train and test.

    Returns:
        Tuple of (X_train, X_test, y_train_level, y_test_level, y_train_score, y_test_score).
    """
    if df is None:
        df = load_raw_data(raw_data_path, verify_hash=True)

    manifest = load_split_manifest(manifest_path, verify_against_dataset=True, raw_data_path=raw_data_path)

    train_indices = manifest["train_indices"]
    test_indices = manifest["test_indices"]

    X, y_level, y_score = get_feature_matrix_and_targets(df)

    X_train = X.loc[train_indices].copy()
    X_test = X.loc[test_indices].copy()

    y_train_level = y_level.loc[train_indices].copy()
    y_test_level = y_level.loc[test_indices].copy()

    y_train_score = y_score.loc[train_indices].copy()
    y_test_score = y_score.loc[test_indices].copy()

    # Re-verify no leakage
    for p_col in PROFILE_COLUMNS + TARGET_COLUMNS:
        if p_col in X_train.columns or p_col in X_test.columns:
            raise LeakageError(f"Leakage detected: column '{p_col}' present in feature split!")

    # Verify column ordering
    if list(X_train.columns) != FEATURE_COLUMNS or list(X_test.columns) != FEATURE_COLUMNS:
        raise SchemaError("Feature column ordering mismatch in partitioned splits.")

    return X_train, X_test, y_train_level, y_test_level, y_train_score, y_test_score


def get_cv_splits(
    manifest_path: Path = SPLIT_MANIFEST_PATH,
) -> List[Tuple[np.ndarray, np.ndarray]]:
    """Returns CV fold splits as (train_pos, val_pos) within the training set.

    Compatible with scikit-learn cross-validation interfaces (e.g. `cv=splits`).
    """
    manifest = load_split_manifest(manifest_path, verify_against_dataset=False)
    splits = []
    for fold in manifest["cv_folds"]:
        train_pos = np.array(fold["train_indices_positional"])
        val_pos = np.array(fold["val_indices_positional"])
        splits.append((train_pos, val_pos))
    return splits
