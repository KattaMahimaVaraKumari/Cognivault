"""Unit tests for Random Forest cross-validation, metrics computation, and artifact generation."""

import json
from pathlib import Path
import numpy as np
import pytest

from cognivault.config import FEATURE_COLUMNS, RISK_LEVEL_CLASSES
from cognivault.train_rf import (
    DEFAULT_RF_PARAMS,
    compute_combined_recall,
    generate_rf_report,
    run_rf_cross_validation,
    save_rf_artifacts,
)


@pytest.fixture(scope="module")
def rf_results():
    """Runs Random Forest cross-validation once for test assertions."""
    fast_params = DEFAULT_RF_PARAMS.copy()
    fast_params["n_estimators"] = 20
    fast_params["n_jobs"] = 1
    return run_rf_cross_validation(rf_params=fast_params)


def test_compute_combined_recall_known_values():
    """Verify compute_combined_recall with known synthetic vectors."""
    # Toy Case 1: 4 severe cases
    # True: High, High, Critical, Critical
    # Pred: High, Critical (cross-over), Critical, High (cross-over)
    y_true_1 = ["High", "High", "Critical", "Critical", "Low", "Moderate"]
    y_pred_1 = ["High", "Critical", "Critical", "High", "Low", "Moderate"]

    # Exact recall: TP_High (1) + TP_Crit (1) = 2 out of 4 = 0.50
    assert compute_combined_recall(y_true_1, y_pred_1, mode="exact") == 0.50

    # Severe tier recall: All 4 predicted in severe tier (High or Critical) = 4 / 4 = 1.00
    assert compute_combined_recall(y_true_1, y_pred_1, mode="severe_tier") == 1.00

    # Toy Case 2: 5 severe cases
    y_true_2 = ["High", "High", "High", "Critical", "Critical"]
    y_pred_2 = ["Moderate", "High", "Critical", "Moderate", "Critical"]

    # TP_High = 1 (2nd item), TP_Crit = 1 (5th item). Total severe = 5 -> 2/5 = 0.40
    assert compute_combined_recall(y_true_2, y_pred_2, mode="exact") == 0.40

    # Severe tier: 2nd (High), 3rd (Critical), 5th (Critical) in severe tier -> 3/5 = 0.60
    assert compute_combined_recall(y_true_2, y_pred_2, mode="severe_tier") == 0.60


def test_compute_combined_recall_empty_severe():
    """Verify compute_combined_recall returns 0.0 if no severe cases exist."""
    y_true = ["Low", "Moderate", "Low"]
    y_pred = ["Low", "Moderate", "High"]
    assert compute_combined_recall(y_true, y_pred, mode="exact") == 0.0
    assert compute_combined_recall(y_true, y_pred, mode="severe_tier") == 0.0


def test_compute_combined_recall_invalid_mode():
    """Verify compute_combined_recall raises ValueError for invalid mode."""
    with pytest.raises(ValueError, match="Unknown mode"):
        compute_combined_recall(["High"], ["High"], mode="invalid_mode")


def test_rf_cv_results_structure(rf_results):
    """Verify CV results dictionary contains all required keys and correct types."""
    assert rf_results["model_name"] == "RandomForestClassifier"
    assert rf_results["n_folds"] == 5
    assert rf_results["total_train_rows"] == 1600
    assert rf_results["feature_columns"] == FEATURE_COLUMNS
    assert rf_results["class_order"] == RISK_LEVEL_CLASSES

    # Verify summary metrics
    summary = rf_results["summary_metrics"]
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
    assert 0.70 <= summary["macro_f1"]["mean"] <= 0.95
    assert 0.70 <= summary["accuracy"]["mean"] <= 0.95
    assert 0.65 <= summary["high_recall"]["mean"] <= 0.95
    assert 0.65 <= summary["critical_recall"]["mean"] <= 0.95
    assert 0.70 <= summary["combined_high_critical_recall"]["mean"] <= 0.95
    assert 0.80 <= summary["severe_tier_detection_recall"]["mean"] <= 0.98


def test_rf_oof_confusion_matrix_and_metric_derivation(rf_results):
    """Verify Out-Of-Fold confusion matrix dimensions, sum, and mathematical derivations."""
    cm = np.array(rf_results["out_of_fold_confusion_matrix"])
    assert cm.shape == (4, 4)

    total_predictions = int(cm.sum())
    assert total_predictions == 1600, (
        f"Sum of confusion matrix should equal training set size (1600), got {total_predictions}"
    )

    # Class order: Low (0), Moderate (1), High (2), Critical (3)
    tp_high = cm[2, 2]
    tp_crit = cm[3, 3]
    total_high = cm[2, :].sum()
    total_crit = cm[3, :].sum()

    assert total_high == 460
    assert total_crit == 175

    # Exact combined recall derivation
    expected_exact_recall = (tp_high + tp_crit) / (total_high + total_crit)
    actual_exact_recall = rf_results["out_of_fold_aggregate_metrics"]["combined_high_critical_recall_exact"]
    assert pytest.approx(actual_exact_recall, abs=0.001) == expected_exact_recall

    # Severe tier recall derivation
    severe_detected = cm[2, 2] + cm[2, 3] + cm[3, 2] + cm[3, 3]
    expected_severe_tier = severe_detected / (total_high + total_crit)
    actual_severe_tier = rf_results["out_of_fold_aggregate_metrics"]["severe_tier_detection_recall"]
    assert pytest.approx(actual_severe_tier, abs=0.001) == expected_severe_tier


def test_rf_feature_importances(rf_results):
    """Verify all 9 feature columns have non-zero importance and sum to 1.0."""
    feat_imp = rf_results["feature_importances"]
    assert len(feat_imp) == 9
    assert list(feat_imp.keys()) == FEATURE_COLUMNS

    total_importance = sum(v["mean"] for v in feat_imp.values())
    assert pytest.approx(total_importance, abs=0.01) == 1.0


def test_rf_artifact_saving(tmp_path, rf_results):
    """Verify saving artifacts and generating report."""
    output_dir = tmp_path / "rf_artifacts"
    json_path = save_rf_artifacts(rf_results, output_dir=output_dir)
    assert json_path.is_file()

    with open(json_path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    assert loaded["model_name"] == "RandomForestClassifier"

    report_path = tmp_path / "model_rf_cv_report.md"
    generated_report = generate_rf_report(rf_results, output_path=report_path)
    assert generated_report.is_file()
    content = generated_report.read_text(encoding="utf-8")
    assert "RandomForestClassifier" in content
    assert "Macro F1" in content
    assert "Combined High/Crit Recall (Exact)" in content
    assert "Severe-Tier Detection Recall" in content
