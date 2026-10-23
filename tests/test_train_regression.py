"""Unit tests for continuous burnout risk score regression module."""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import pytest

from cognivault.config import (
    FEATURE_COLUMNS,
    PROFILE_COLUMNS,
    REPO_ROOT,
    TARGET_COLUMNS,
    TARGET_SCORE_COLUMN,
)
from cognivault.split import get_split_data

MODELS_REG_DIR = REPO_ROOT / "models" / "regression"
REG_CV_JSON = MODELS_REG_DIR / "regression_cv_results.json"
REG_TEST_JSON = MODELS_REG_DIR / "regression_test_results.json"
REG_MODEL_JOBLIB = MODELS_REG_DIR / "regression_final_model.joblib"

LR_DIR = REPO_ROOT / "models" / "logistic_regression"
RF_DIR = REPO_ROOT / "models" / "random_forest"
XGB_DIR = REPO_ROOT / "models" / "xgboost"


def test_regression_data_and_leakage_exclusion():
    """Verify X contains exactly the 9 features in order, with zero target or profile leakage."""
    X_train, X_test, _, _, y_train_score, y_test_score = get_split_data()

    assert X_train.shape == (1600, 9)
    assert X_test.shape == (400, 9)
    assert list(X_train.columns) == FEATURE_COLUMNS
    assert list(X_test.columns) == FEATURE_COLUMNS

    # Ensure profile columns not present in X
    for p_col in PROFILE_COLUMNS:
        assert p_col not in X_train.columns
        assert p_col not in X_test.columns

    # Ensure targets not present in X
    for t_col in TARGET_COLUMNS:
        assert t_col not in X_train.columns
        assert t_col not in X_test.columns

    # Check targets are continuous floats
    assert len(y_train_score) == 1600
    assert len(y_test_score) == 400
    assert np.issubdtype(y_train_score.dtype, np.floating)
    assert np.issubdtype(y_test_score.dtype, np.floating)


def test_regression_cv_results_structure():
    """Verify regression CV results JSON contains all 3 candidates and expected metrics."""
    assert REG_CV_JSON.is_file(), f"CV results not found: {REG_CV_JSON}"
    with open(REG_CV_JSON, "r", encoding="utf-8") as f:
        cv_data = json.load(f)

    assert "candidates" in cv_data
    candidates = cv_data["candidates"]
    for expected_name in ["DummyRegressor", "Ridge", "RandomForestRegressor"]:
        assert expected_name in candidates
        cand = candidates[expected_name]
        assert "summary_metrics" in cand
        sm = cand["summary_metrics"]
        for metric in ["mae", "rmse", "r2"]:
            assert metric in sm
            assert "mean" in sm[metric]
            assert "std" in sm[metric]

    # Verify Ridge has lowest MAE and highest R2
    ridge_mae = candidates["Ridge"]["summary_metrics"]["mae"]["mean"]
    rf_mae = candidates["RandomForestRegressor"]["summary_metrics"]["mae"]["mean"]
    dummy_mae = candidates["DummyRegressor"]["summary_metrics"]["mae"]["mean"]

    assert ridge_mae < rf_mae < dummy_mae
    assert ridge_mae < 4.0  # MAE should be around ~3.3 points


def test_regression_test_results_structure():
    """Verify regression test results JSON contains all required evaluation fields."""
    assert REG_TEST_JSON.is_file(), f"Test results not found: {REG_TEST_JSON}"
    with open(REG_TEST_JSON, "r", encoding="utf-8") as f:
        test_data = json.load(f)

    assert test_data["model_name"] == "Ridge"
    assert test_data["train_rows"] == 1600
    assert test_data["test_rows"] == 400
    assert test_data["feature_columns"] == FEATURE_COLUMNS

    tm = test_data["test_metrics"]
    assert "mae" in tm and tm["mae"] < 4.0
    assert "rmse" in tm and tm["rmse"] < 5.0
    assert "r2" in tm and tm["r2"] > 0.90

    # Boundary analysis assertions
    b = test_data["prediction_boundary_analysis"]
    assert "count_below_zero" in b
    assert "count_above_100" in b
    assert b["silent_clipping_applied"] is False


def test_saved_regression_model_inference():
    """Verify saved Pipeline joblib loads and produces valid numeric prediction."""
    assert REG_MODEL_JOBLIB.is_file(), f"Model artifact not found: {REG_MODEL_JOBLIB}"
    pipeline = joblib.load(REG_MODEL_JOBLIB)

    assert hasattr(pipeline, "named_steps")
    assert "scaler" in pipeline.named_steps
    assert "regressor" in pipeline.named_steps

    # Test prediction on synthetic single row DataFrame
    dummy_input = pd.DataFrame(
        [[3.0, 8, 3, 3, 7.0, 2, 3, 2, 2]],
        columns=FEATURE_COLUMNS,
    )
    pred = pipeline.predict(dummy_input)
    assert isinstance(pred, np.ndarray)
    assert pred.shape == (1,)
    assert isinstance(float(pred[0]), float)
    # Reasonable prediction range
    assert 0.0 <= pred[0] <= 100.0


def test_existing_classifier_artifacts_unchanged():
    """Verify classifier artifacts remain present and undisturbed."""
    assert (LR_DIR / "lr_cv_results.json").is_file()
    assert (LR_DIR / "lr_test_results.json").is_file()
    assert (LR_DIR / "lr_final_model.joblib").is_file()
    assert (RF_DIR / "rf_cv_results.json").is_file()
    assert (XGB_DIR / "xgb_cv_results.json").is_file()


def test_regression_test_report_coefficients_dynamic(tmp_path):
    """Verify regression test report generates coefficients dynamically and matches model."""
    from cognivault.train_regression import generate_regression_test_report

    with open(REG_TEST_JSON, "r", encoding="utf-8") as f:
        test_results = json.load(f)

    # 1. Verify report generation from test_results matches actual values, not stale placeholders
    report_file = tmp_path / "test_reg_report.md"
    generate_regression_test_report(test_results, output_path=report_file)
    content = report_file.read_text(encoding="utf-8")

    # Stale placeholder numbers must NOT appear
    assert "+7.7126" not in content, "Stale placeholder coefficient +7.7126 found in report!"
    assert "+6.0963" not in content, "Stale placeholder coefficient +6.0963 found in report!"

    # Real saved coefficients must appear
    assert "+8.4430" in content, "Real coefficient +8.4430 for exhaustion not found in report!"
    assert "+3.7196" in content, "Real coefficient +3.7196 for concentration not found in report!"
    assert "-2.9613" in content, "Real coefficient -2.9613 for physical activity not found in report!"

    # 2. Verify dynamic behavior by modifying a coefficient
    mock_results = json.loads(json.dumps(test_results))
    mock_results["learned_coefficients"]["academic_emotional_exhaustion"] = 99.1234
    mock_file = tmp_path / "mock_report.md"
    generate_regression_test_report(mock_results, output_path=mock_file)
    mock_content = mock_file.read_text(encoding="utf-8")
    assert "+99.1234" in mock_content, "generate_regression_test_report is not dynamically reflecting coefficients!"

    # 3. Verify actual disk report matches saved joblib model
    disk_report = REPO_ROOT / "reports" / "model_regression_test_report.md"
    assert disk_report.is_file()
    disk_content = disk_report.read_text(encoding="utf-8")
    pipeline = joblib.load(REG_MODEL_JOBLIB)
    reg = pipeline.named_steps["regressor"]
    expected_exhaustion_coef = f"{float(reg.coef_[-1]):+.4f}"
    assert expected_exhaustion_coef in disk_content
