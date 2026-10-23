"""Unit tests for Logistic Regression pipeline, cross-validation, and metrics."""

import json
from pathlib import Path
import numpy as np
import pytest

from cognivault.config import FEATURE_COLUMNS, RISK_LEVEL_CLASSES
from cognivault.train_lr import (
    DEFAULT_LR_PARAMS,
    build_lr_pipeline,
    generate_lr_report,
    run_lr_cross_validation,
    save_lr_artifacts,
)


@pytest.fixture(scope="module")
def lr_results():
    """Runs Logistic Regression cross-validation once for test assertions."""
    return run_lr_cross_validation(lr_params=DEFAULT_LR_PARAMS)


def test_lr_pipeline_structure():
    """Verify Pipeline contains StandardScaler and LogisticRegression steps."""
    pipeline = build_lr_pipeline(DEFAULT_LR_PARAMS)
    assert "scaler" in pipeline.named_steps
    assert "classifier" in pipeline.named_steps


def test_lr_cv_results_structure(lr_results):
    """Verify CV results dictionary contains all required keys and correct types."""
    assert lr_results["model_name"] == "LogisticRegression"
    assert lr_results["n_folds"] == 5
    assert lr_results["total_train_rows"] == 1600
    assert lr_results["feature_columns"] == FEATURE_COLUMNS
    assert lr_results["class_order"] == RISK_LEVEL_CLASSES

    # Verify summary metrics
    summary = lr_results["summary_metrics"]
    for key in [
        "macro_f1",
        "accuracy",
        "weighted_f1",
        "high_recall",
        "critical_recall",
        "combined_high_critical_recall",
        "severe_tier_detection_recall",
        "fit_time_seconds",
    ]:
        assert key in summary
        assert "mean" in summary[key]
        assert "std" in summary[key]
        assert "std_sample" in summary[key]
        assert len(summary[key]["values"]) == 5

    # Check reasonable performance ranges
    assert 0.75 <= summary["macro_f1"]["mean"] <= 0.95
    assert 0.75 <= summary["accuracy"]["mean"] <= 0.95
    assert 0.70 <= summary["high_recall"]["mean"] <= 0.95
    assert 0.85 <= summary["critical_recall"]["mean"] <= 1.00
    assert 0.75 <= summary["combined_high_critical_recall"]["mean"] <= 0.95
    assert 0.85 <= summary["severe_tier_detection_recall"]["mean"] <= 0.98


def test_lr_oof_confusion_matrix_and_metric_derivation(lr_results):
    """Verify Out-Of-Fold confusion matrix dimensions and mathematical derivations."""
    cm = np.array(lr_results["out_of_fold_confusion_matrix"])
    assert cm.shape == (4, 4)

    total_predictions = int(cm.sum())
    assert total_predictions == 1600

    # Class order: Low (0), Moderate (1), High (2), Critical (3)
    tp_high = cm[2, 2]
    tp_crit = cm[3, 3]
    total_high = cm[2, :].sum()
    total_crit = cm[3, :].sum()

    assert total_high == 460
    assert total_crit == 175

    # Exact combined recall derivation
    expected_exact_recall = (tp_high + tp_crit) / (total_high + total_crit)
    actual_exact_recall = lr_results["out_of_fold_aggregate_metrics"]["combined_high_critical_recall_exact"]
    assert pytest.approx(actual_exact_recall, abs=0.001) == expected_exact_recall

    # Severe tier recall derivation
    severe_detected = cm[2, 2] + cm[2, 3] + cm[3, 2] + cm[3, 3]
    expected_severe_tier = severe_detected / (total_high + total_crit)
    actual_severe_tier = lr_results["out_of_fold_aggregate_metrics"]["severe_tier_detection_recall"]
    assert pytest.approx(actual_severe_tier, abs=0.001) == expected_severe_tier


def test_lr_coefficients_integrity(lr_results):
    """Verify learned coefficients exist for all classes and features."""
    coefs = lr_results["mean_coefficients"]
    for cls in RISK_LEVEL_CLASSES:
        assert cls in coefs
        assert len(coefs[cls]) == len(FEATURE_COLUMNS)
        for feat in FEATURE_COLUMNS:
            assert feat in coefs[cls]


def test_lr_artifact_saving(tmp_path, lr_results):
    """Verify saving artifacts and generating report."""
    output_dir = tmp_path / "lr_artifacts"
    json_path = save_lr_artifacts(lr_results, output_dir=output_dir)
    assert json_path.is_file()

    with open(json_path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    assert loaded["model_name"] == "LogisticRegression"

    report_path = tmp_path / "model_lr_cv_report.md"
    generated_report = generate_lr_report(lr_results, output_path=report_path)
    assert generated_report.is_file()
    content = generated_report.read_text(encoding="utf-8")
    assert "LogisticRegression" in content
    assert "Macro F1" in content
    assert "Combined High/Crit Recall (Exact)" in content
    assert "Severe-Tier Detection Recall" in content
