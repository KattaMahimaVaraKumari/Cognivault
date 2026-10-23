"""Unit tests for train/test splitting, cross-validation folds, stratification, and leakage prevention."""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from cognivault.config import (
    EXPECTED_RAW_SHA256,
    FEATURE_COLUMNS,
    PROFILE_COLUMNS,
    RAW_DATA_PATH,
    TARGET_COLUMNS,
    TARGET_LEVEL_COLUMN,
    TARGET_SCORE_COLUMN,
)
from cognivault.data import DataValidationError, LeakageError, SchemaError, load_raw_data
from cognivault.split import (
    SPLIT_MANIFEST_PATH,
    create_split_manifest,
    get_cv_splits,
    get_split_data,
    load_split_manifest,
    save_split_manifest,
)


@pytest.fixture(scope="module")
def manifest():
    """Loads or creates the standard split manifest."""
    if not SPLIT_MANIFEST_PATH.is_file():
        m = create_split_manifest()
        save_split_manifest(m)
    return load_split_manifest(SPLIT_MANIFEST_PATH)


def test_manifest_metadata(manifest):
    """Verify manifest records accurate metadata and expected SHA-256 hash."""
    assert manifest["dataset_sha256"] == EXPECTED_RAW_SHA256
    assert manifest["total_rows"] == 2000
    assert manifest["random_state"] == 42
    assert manifest["stratify_column"] == TARGET_LEVEL_COLUMN
    assert manifest["train_size"] == 1600
    assert manifest["test_size"] == 400
    assert manifest["n_cv_folds"] == 5


def test_split_sizes_and_disjointness(manifest):
    """Verify 1,600 train rows, 400 test rows, no overlap, and complete coverage."""
    train_idx = set(manifest["train_indices"])
    test_idx = set(manifest["test_indices"])

    assert len(train_idx) == 1600
    assert len(test_idx) == 400
    assert train_idx.intersection(test_idx) == set(), "Train and test sets must be completely disjoint!"
    assert train_idx.union(test_idx) == set(range(2000)), "Union of train and test must equal all 2,000 indices!"


def test_stratification_preservation(manifest):
    """Verify class proportions are strictly preserved across train and test partitions."""
    full_counts = manifest["class_counts"]["full"]
    train_counts = manifest["class_counts"]["train"]
    test_counts = manifest["class_counts"]["test"]

    # Exact expected counts: 80% train, 20% test
    assert full_counts == {"Moderate": 725, "High": 575, "Low": 481, "Critical": 219}
    assert train_counts == {"Moderate": 580, "High": 460, "Low": 385, "Critical": 175}
    assert test_counts == {"Moderate": 145, "High": 115, "Low": 96, "Critical": 44}

    # Verify percentages match within 0.1%
    train_pcts = manifest["class_percentages"]["train"]
    test_pcts = manifest["class_percentages"]["test"]
    for cls in ["Moderate", "High", "Low", "Critical"]:
        assert abs(train_pcts[cls] - test_pcts[cls]) < 0.2


def test_split_reproducibility():
    """Verify that re-creating the split with seed 42 produces identical indices."""
    manifest_1 = create_split_manifest(random_state=42)
    manifest_2 = create_split_manifest(random_state=42)

    assert manifest_1["train_indices"] == manifest_2["train_indices"]
    assert manifest_1["test_indices"] == manifest_2["test_indices"]
    for f1, f2 in zip(manifest_1["cv_folds"], manifest_2["cv_folds"]):
        assert f1["train_indices_global"] == f2["train_indices_global"]
        assert f1["val_indices_global"] == f2["val_indices_global"]


def test_cv_folds_integrity(manifest):
    """Verify 5-fold cross-validation folds on the 1,600 training instances."""
    folds = manifest["cv_folds"]
    assert len(folds) == 5

    train_idx_set = set(manifest["train_indices"])
    val_indices_all_folds = set()

    for fold in folds:
        f_train_global = set(fold["train_indices_global"])
        f_val_global = set(fold["val_indices_global"])

        assert len(f_train_global) == 1280
        assert len(f_val_global) == 320
        assert f_train_global.intersection(f_val_global) == set(), "Fold train and val must be disjoint!"
        assert f_train_global.issubset(train_idx_set), "Fold train must only contain training rows!"
        assert f_val_global.issubset(train_idx_set), "Fold val must only contain training rows!"

        # Ensure validation sets across folds do not overlap
        assert f_val_global.intersection(val_indices_all_folds) == set()
        val_indices_all_folds.update(f_val_global)

    # All validation sets together must reconstruct the full training set
    assert val_indices_all_folds == train_idx_set


def test_feature_order_and_leakage_exclusion():
    """Verify X_train/X_test contain strictly the 9 features in order, with zero profile/targets."""
    X_train, X_test, y_train_level, y_test_level, y_train_score, y_test_score = get_split_data()

    # Shape checks
    assert X_train.shape == (1600, 9)
    assert X_test.shape == (400, 9)

    # Strict feature ordering check
    assert list(X_train.columns) == FEATURE_COLUMNS
    assert list(X_test.columns) == FEATURE_COLUMNS

    # Strict profile column exclusion
    for col in PROFILE_COLUMNS:
        assert col not in X_train.columns
        assert col not in X_test.columns

    # Strict target column exclusion
    for col in TARGET_COLUMNS:
        assert col not in X_train.columns
        assert col not in X_test.columns

    # Target series integrity
    assert len(y_train_level) == 1600
    assert len(y_test_level) == 400
    assert len(y_train_score) == 1600
    assert len(y_test_score) == 400
    assert y_train_level.name == TARGET_LEVEL_COLUMN
    assert y_test_level.name == TARGET_LEVEL_COLUMN
    assert y_train_score.name == TARGET_SCORE_COLUMN
    assert y_test_score.name == TARGET_SCORE_COLUMN


def test_cv_splits_sklearn_compatibility():
    """Verify get_cv_splits returns 5 valid (train_pos, val_pos) tuples."""
    splits = get_cv_splits()
    assert len(splits) == 5

    for train_pos, val_pos in splits:
        assert isinstance(train_pos, np.ndarray)
        assert isinstance(val_pos, np.ndarray)
        assert len(train_pos) == 1280
        assert len(val_pos) == 320
        assert len(np.intersect1d(train_pos, val_pos)) == 0
        assert np.all(train_pos >= 0) and np.all(train_pos < 1600)
        assert np.all(val_pos >= 0) and np.all(val_pos < 1600)


def test_manifest_hash_tamper_fails(tmp_path):
    """Verify that tampering with the dataset hash causes load_split_manifest to fail."""
    tampered_manifest = tmp_path / "tampered_manifest.json"
    m = create_split_manifest()
    m["dataset_sha256"] = "0000000000000000000000000000000000000000000000000000000000000000"
    save_split_manifest(m, tampered_manifest)

    with pytest.raises(DataValidationError, match="Dataset hash mismatch"):
        load_split_manifest(tampered_manifest, verify_against_dataset=True)
