"""Unit tests for final test evaluation results, metric derivations, and model artifact persistence."""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import pytest

from cognivault.config import FEATURE_COLUMNS, REPO_ROOT, RISK_LEVEL_CLASSES

MODELS_LR_DIR = REPO_ROOT / "models" / "logistic_regression"
TEST_RESULTS_JSON = MODELS_LR_DIR / "lr_test_results.json"
MODEL_JOBLIB_PATH = MODELS_LR_DIR / "lr_final_model.joblib"
CV_RESULTS_JSON = MODELS_LR_DIR / "lr_cv_results.json"


@pytest.fixture(scope="module")
def test_results():
    """Loads the serialized final test evaluation results."""
    assert TEST_RESULTS_JSON.is_file(), f"Test results not found: {TEST_RESULTS_JSON}"
    with open(TEST_RESULTS_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def test_saved_test_results_structure(test_results):
    """Verify test results JSON contains all expected fields and dimensions."""
    assert test_results["model_name"] == "LogisticRegression"
    assert test_results["train_rows"] == 1600
    assert test_results["test_rows"] == 400
    assert test_results["feature_columns"] == FEATURE_COLUMNS
    assert test_results["class_order"] == RISK_LEVEL_CLASSES

    m = test_results["test_metrics"]
    for key in [
        "accuracy",
        "balanced_accuracy",
        "macro_f1",
        "weighted_f1",
        "high_recall",
        "critical_recall",
        "combined_high_critical_recall_exact",
        "severe_tier_detection_recall",
    ]:
        assert key in m
        assert 0.70 <= m[key] <= 1.0


def test_saved_test_confusion_matrix_derivations(test_results):
    """Verify exact mathematical derivations from the test confusion matrix."""
    cm = np.array(test_results["confusion_matrix"])
    assert cm.shape == (4, 4)
    assert int(cm.sum()) == 400

    # Class indexing: Low (0), Moderate (1), High (2), Critical (3)
    # Total true per class
    n_low = cm[0].sum()
    n_mod = cm[1].sum()
    n_high = cm[2].sum()
    n_crit = cm[3].sum()

    assert n_low == 96
    assert n_mod == 145
    assert n_high == 115
    assert n_crit == 44

    # 1. Accuracy
    expected_acc = (cm[0, 0] + cm[1, 1] + cm[2, 2] + cm[3, 3]) / 400
    assert pytest.approx(test_results["test_metrics"]["accuracy"], abs=0.001) == expected_acc

    # 2. Combined Exact High/Critical Recall
    expected_exact_recall = (cm[2, 2] + cm[3, 3]) / (n_high + n_crit)
    assert (
        pytest.approx(
            test_results["test_metrics"]["combined_high_critical_recall_exact"], abs=0.001
        )
        == expected_exact_recall
    )

    # 3. Severe-Tier Detection Recall
    severe_detected = cm[2, 2] + cm[2, 3] + cm[3, 2] + cm[3, 3]
    expected_severe_tier = severe_detected / (n_high + n_crit)
    assert (
        pytest.approx(
            test_results["test_metrics"]["severe_tier_detection_recall"], abs=0.001
        )
        == expected_severe_tier
    )


def test_saved_model_joblib_persistence():
    """Verify saved Pipeline joblib loads and predicts correctly on synthetic feature vector."""
    assert MODEL_JOBLIB_PATH.is_file(), f"Model artifact not found: {MODEL_JOBLIB_PATH}"
    pipeline = joblib.load(MODEL_JOBLIB_PATH)

    assert hasattr(pipeline, "named_steps")
    assert "scaler" in pipeline.named_steps
    assert "classifier" in pipeline.named_steps

    # Test inference on single feature row
    dummy_input = pd.DataFrame(
        [[3.0, 8, 3, 3, 7.0, 2, 3, 2, 2]],
        columns=FEATURE_COLUMNS,
    )
    prediction = pipeline.predict(dummy_input)
    assert len(prediction) == 1
    assert prediction[0] in RISK_LEVEL_CLASSES

    proba = pipeline.predict_proba(dummy_input)
    assert proba.shape == (1, 4)
    assert pytest.approx(proba.sum(), abs=0.001) == 1.0


def test_cv_artifacts_not_overwritten():
    """Verify that CV results artifact was not modified or overwritten by test run."""
    assert CV_RESULTS_JSON.is_file()
    with open(CV_RESULTS_JSON, "r", encoding="utf-8") as f:
        cv_data = json.load(f)
    assert cv_data["n_folds"] == 5
    assert "summary_metrics" in cv_data
    assert "macro_f1" in cv_data["summary_metrics"]


def test_lr_test_report_class_coefficients_mapping(tmp_path):
    """Verify that generate_lr_test_report maps class coefficients using estimator classes_."""
    from cognivault.evaluate_lr import generate_lr_test_report

    with open(TEST_RESULTS_JSON, "r", encoding="utf-8") as f:
        test_results = json.load(f)

    report_file = tmp_path / "test_lr_report.md"
    generate_lr_test_report(test_results, output_path=report_file)
    content = report_file.read_text(encoding="utf-8")

    # In the report table:
    # Low risk must have negative emotional exhaustion (-4.7288) and positive sleep (+1.5687)
    # Critical risk must have positive emotional exhaustion (+4.8620) and negative sleep (-1.7133)
    exhaustion_line = [line for line in content.splitlines() if "academic_emotional_exhaustion" in line][0]
    parts = [p.strip() for p in exhaustion_line.split("|") if p.strip()]

    # Format: Feature Name | Low | Moderate | High | Critical
    assert parts[0] == "`academic_emotional_exhaustion`"
    assert parts[1] == "-4.7288", f"Low class mapped incorrectly: expected -4.7288, got {parts[1]}"
    assert parts[2] == "-1.5402", f"Moderate class mapped incorrectly: expected -1.5402, got {parts[2]}"
    assert parts[3] == "+1.4071", f"High class mapped incorrectly: expected +1.4071, got {parts[3]}"
    assert parts[4] == "+4.8620", f"Critical class mapped incorrectly: expected +4.8620, got {parts[4]}"

    # Verify actual disk report matches
    disk_report = REPO_ROOT / "reports" / "model_lr_test_report.md"
    assert disk_report.is_file()
    disk_content = disk_report.read_text(encoding="utf-8")
    assert "-4.7288 | -1.5402 | +1.4071 | +4.8620" in disk_content
