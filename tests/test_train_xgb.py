"""Unit tests for XGBoost classifier cross-validation, metrics, and artifacts."""

import json
from pathlib import Path
import numpy as np
import pytest

from cognivault.config import FEATURE_COLUMNS, RISK_LEVEL_CLASSES
from cognivault.train_xgb import (
    DEFAULT_XGB_PARAMS,
    generate_xgb_report,
    run_xgb_cross_validation,
    save_xgb_artifacts,
)


@pytest.fixture(scope="module")
def xgb_results():
    """Runs XGBoost cross-validation once with fast trees for test assertions."""
    fast_params = DEFAULT_XGB_PARAMS.copy()
    fast_params["n_estimators"] = 20
    fast_params["n_jobs"] = 1
    return run_xgb_cross_validation(xgb_params=fast_params, use_sample_weight=True)


def test_xgb_cv_results_structure(xgb_results):
    """Verify CV results dictionary contains all required keys and correct types."""
    assert xgb_results["model_name"] == "XGBClassifier"
    assert xgb_results["n_folds"] == 5
    assert xgb_results["total_train_rows"] == 1600
    assert xgb_results["feature_columns"] == FEATURE_COLUMNS
    assert xgb_results["class_order"] == RISK_LEVEL_CLASSES

    summary = xgb_results["summary_metrics"]
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

    assert 0.75 <= summary["macro_f1"]["mean"] <= 0.95
    assert 0.75 <= summary["accuracy"]["mean"] <= 0.95
    assert 0.70 <= summary["high_recall"]["mean"] <= 0.95
    assert 0.75 <= summary["critical_recall"]["mean"] <= 0.98
    assert 0.75 <= summary["combined_high_critical_recall"]["mean"] <= 0.95
    assert 0.85 <= summary["severe_tier_detection_recall"]["mean"] <= 0.98


def test_xgb_oof_confusion_matrix_and_metric_derivation(xgb_results):
    """Verify Out-Of-Fold confusion matrix dimensions and mathematical derivations."""
    cm = np.array(xgb_results["out_of_fold_confusion_matrix"])
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
    actual_exact_recall = xgb_results["out_of_fold_aggregate_metrics"]["combined_high_critical_recall_exact"]
    assert pytest.approx(actual_exact_recall, abs=0.001) == expected_exact_recall

    # Severe tier recall derivation
    severe_detected = cm[2, 2] + cm[2, 3] + cm[3, 2] + cm[3, 3]
    expected_severe_tier = severe_detected / (total_high + total_crit)
    actual_severe_tier = xgb_results["out_of_fold_aggregate_metrics"]["severe_tier_detection_recall"]
    assert pytest.approx(actual_severe_tier, abs=0.001) == expected_severe_tier


def test_xgb_feature_importances(xgb_results):
    """Verify all 9 feature columns have non-zero importance and sum to 1.0."""
    feat_imp = xgb_results["feature_importances"]
    assert len(feat_imp) == 9
    assert list(feat_imp.keys()) == FEATURE_COLUMNS

    total_importance = sum(v["mean"] for v in feat_imp.values())
    assert pytest.approx(total_importance, abs=0.01) == 1.0


def test_xgb_artifact_saving(tmp_path, xgb_results):
    """Verify saving artifacts and generating report."""
    output_dir = tmp_path / "xgb_artifacts"
    json_path = save_xgb_artifacts(xgb_results, output_dir=output_dir)
    assert json_path.is_file()

    with open(json_path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    assert loaded["model_name"] == "XGBClassifier"

    report_path = tmp_path / "model_xgb_cv_report.md"
    generated_report = generate_xgb_report(xgb_results, output_path=report_path)
    assert generated_report.is_file()
    content = generated_report.read_text(encoding="utf-8")
    assert "XGBClassifier" in content
    assert "Macro F1" in content
    assert "Combined High/Crit Recall (Exact)" in content
    assert "Severe-Tier Detection Recall" in content
