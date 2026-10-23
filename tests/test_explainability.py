"""Unit tests for the Cognivault explainability layer (Block 6)."""

import hashlib
from pathlib import Path
import pytest
import numpy as np
import pandas as pd

from cognivault.config import (
    EXPECTED_RAW_SHA256,
    FEATURE_COLUMNS,
    RAW_DATA_PATH,
    REPO_ROOT,
    RISK_LEVEL_CLASSES,
)
from cognivault.data import SchemaError
from cognivault.split import SPLIT_MANIFEST_PATH
from cognivault.explainability import (
    MODELS_LR_PATH,
    MODELS_REG_PATH,
    REPORT_EXPLAIN_VALIDATION_PATH,
    REPORT_IMPORTANCE_PATH,
    SYNTHETIC_DATA_DISCLAIMER,
    explain_individual_prediction,
    generate_explainability_validation_report,
    generate_feature_importance_report,
    get_global_feature_importance,
    load_explainability_models,
)

EXPECTED_MANIFEST_SHA256 = (
    "f9c492abe9d7956429719ce5ab06d073a91fe1de8ec50148a105c71cdc1958de"
)


@pytest.fixture
def sample_valid_student() -> dict:
    return {
        "study_hours_outside_classes_per_day": 3.0,
        "academic_tasks_per_week": 8,
        "academic_workload": 3,
        "time_pressure": 4,
        "avg_sleep_hours": 6.5,
        "wakes_up_tired": 3,
        "physical_activity_days_per_week": 2,
        "difficulty_concentrating": 3,
        "academic_emotional_exhaustion": 3,
    }


def test_load_explainability_models():
    """Verify that both serialized models load correctly and have required steps."""
    lr_pipe, reg_pipe = load_explainability_models()
    assert "scaler" in lr_pipe.named_steps
    assert "classifier" in lr_pipe.named_steps
    assert "scaler" in reg_pipe.named_steps
    assert "regressor" in reg_pipe.named_steps

    with pytest.raises(FileNotFoundError):
        load_explainability_models(lr_model_path=Path("non_existent_file.joblib"))


def test_get_global_feature_importance():
    """Verify extraction and ranking of global model coefficients."""
    global_imp = get_global_feature_importance()

    assert "ridge_coefficients" in global_imp
    assert "logistic_regression_coefficients" in global_imp
    assert "ridge_ranked_by_magnitude" in global_imp
    assert "disclaimer" in global_imp

    # 9 features present
    assert len(global_imp["ridge_coefficients"]) == 9
    for col in FEATURE_COLUMNS:
        assert col in global_imp["ridge_coefficients"]

    # Ridge coefficients directional sanity check
    assert global_imp["ridge_coefficients"]["academic_emotional_exhaustion"] > 0
    assert global_imp["ridge_coefficients"]["avg_sleep_hours"] < 0
    assert global_imp["ridge_coefficients"]["physical_activity_days_per_week"] < 0

    # Logistic Regression has all classes
    lr_coefs = global_imp["logistic_regression_coefficients"]
    for cls in RISK_LEVEL_CLASSES:
        assert cls in lr_coefs
        assert len(lr_coefs[cls]) == 9


def test_explain_individual_prediction_exact_reconstruction(sample_valid_student):
    """Verify exact mathematical additive decomposition for continuous score and logits."""
    res = explain_individual_prediction(sample_valid_student)

    # Predictions structure
    preds = res["predictions"]
    assert preds["predicted_risk_level"] in RISK_LEVEL_CLASSES
    assert 0.0 <= preds["predicted_burnout_score"] <= 100.0

    # Class probabilities sum to 1.0 (accounting for 4-decimal rounding)
    probs = preds["class_probabilities"]
    assert sum(probs.values()) == pytest.approx(1.0, abs=1e-3)

    # Score explanation exact reconstruction
    score_exp = res["score_explanation"]
    assert score_exp["is_additive_exact"] is True
    assert score_exp["reconstruction_difference"] < 1e-5
    assert len(score_exp["contributions"]) == 9

    # Classifier logit exact reconstruction
    clf_exp = res["classifier_explanation"]
    assert clf_exp["is_additive_exact"] is True
    assert clf_exp["reconstruction_difference"] < 1e-5
    assert len(clf_exp["contributions"]) == 9

    # Non-causal disclaimer present
    assert "safe_interpretation_notice" in res
    assert SYNTHETIC_DATA_DISCLAIMER in res["safe_interpretation_notice"]


def test_explain_individual_prediction_accepts_pandas_series(sample_valid_student):
    """Verify that pd.Series input works identically."""
    series_input = pd.Series(sample_valid_student)
    res = explain_individual_prediction(series_input)
    assert res["score_explanation"]["is_additive_exact"] is True


def test_explain_individual_prediction_rejects_invalid_schema():
    """Verify strict rejection of missing, extra, or null values."""
    # Missing feature
    incomplete = {
        "study_hours_outside_classes_per_day": 3.0,
        "academic_tasks_per_week": 8,
    }
    with pytest.raises(SchemaError, match="Missing required feature columns"):
        explain_individual_prediction(incomplete)

    # Extra unknown feature
    with_extra = {
        "study_hours_outside_classes_per_day": 3.0,
        "academic_tasks_per_week": 8,
        "academic_workload": 3,
        "time_pressure": 4,
        "avg_sleep_hours": 6.5,
        "wakes_up_tired": 3,
        "physical_activity_days_per_week": 2,
        "difficulty_concentrating": 3,
        "academic_emotional_exhaustion": 3,
        "institution": "Excluded University",
    }
    with pytest.raises(SchemaError, match="Unexpected extra columns"):
        explain_individual_prediction(with_extra)

    # Null value
    with_nan = {
        "study_hours_outside_classes_per_day": 3.0,
        "academic_tasks_per_week": 8,
        "academic_workload": 3,
        "time_pressure": 4,
        "avg_sleep_hours": None,
        "wakes_up_tired": 3,
        "physical_activity_days_per_week": 2,
        "difficulty_concentrating": 3,
        "academic_emotional_exhaustion": 3,
    }
    with pytest.raises(SchemaError, match="Found null values in feature columns"):
        explain_individual_prediction(with_nan)


def test_reports_generation_and_integrity(tmp_path):
    """Verify report generation functions write valid markdown files."""
    rep1 = generate_feature_importance_report(output_path=tmp_path / "imp_test.md")
    assert rep1.is_file()
    content1 = rep1.read_text(encoding="utf-8")
    assert "Ridge Score Regressor: Standardized Coefficients" in content1
    assert "Logistic Regression Classifier: Standardized Log-Odds Coefficients" in content1

    rep2 = generate_explainability_validation_report(output_path=tmp_path / "val_test.md")
    assert rep2.is_file()
    content2 = rep2.read_text(encoding="utf-8")
    assert "Persona 1" in content2
    assert "Exact Bit-Level Match: True" in content2


def test_existing_data_and_manifest_hashes_unchanged():
    """Verify that Block 6 changes did not alter raw dataset or split manifest."""
    raw_bytes = RAW_DATA_PATH.read_bytes()
    raw_hash = hashlib.sha256(raw_bytes).hexdigest()
    assert raw_hash == EXPECTED_RAW_SHA256, "Raw dataset has been unexpectedly modified!"

    manifest_bytes = SPLIT_MANIFEST_PATH.read_bytes()
    manifest_hash = hashlib.sha256(manifest_bytes).hexdigest()
    assert manifest_hash == EXPECTED_MANIFEST_SHA256, "Split manifest has been unexpectedly modified!"
