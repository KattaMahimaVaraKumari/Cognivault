"""Tests for the Block 7 unified prediction interface (cognivault.predict).

All tests use the saved artifacts; nothing is retrained or re-evaluated.
"""

import hashlib
import json
import math

import numpy as np
import pandas as pd
import pytest
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.pipeline import Pipeline

from cognivault import predict as predict_module
from cognivault.config import FEATURE_COLUMNS, REPO_ROOT, RISK_LEVEL_CLASSES
from cognivault.data import DataValidationError
from cognivault.explainability import explain_individual_prediction
from cognivault.predict import (
    DISPLAY_SCORE_MAX,
    DISPLAY_SCORE_MIN,
    PredictionInputError,
    bound_display_score,
    get_models,
    predict_student_risk,
)

PROTECTED_FILES = [
    "data/raw/cognivault_final_dataset.csv",
    "data/interim/split_indices.json",
    "models/logistic_regression/lr_final_model.joblib",
    "models/logistic_regression/lr_cv_results.json",
    "models/logistic_regression/lr_test_results.json",
    "models/regression/regression_final_model.joblib",
    "models/regression/regression_cv_results.json",
    "models/regression/regression_test_results.json",
    "reports/model_lr_test_report.md",
    "reports/model_regression_test_report.md",
    "reports/feature_importance_report.md",
    "reports/explainability_validation_report.md",
]
EXPECTED_SHA256 = {
    "data/raw/cognivault_final_dataset.csv": "b2c24f334cd6cef42265c29659b28291f040ab17ec30278aa175af3d06e2a762",
    "data/interim/split_indices.json": "f9c492abe9d7956429719ce5ab06d073a91fe1de8ec50148a105c71cdc1958de",
}

TYPICAL = {
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
# Within observed training ranges, yet the Ridge raw score is negative (~ -7.35).
LOW_OBSERVED = {
    "study_hours_outside_classes_per_day": 0.5,
    "academic_tasks_per_week": 1,
    "academic_workload": 1,
    "time_pressure": 1,
    "avg_sleep_hours": 10.0,
    "wakes_up_tired": 1,
    "physical_activity_days_per_week": 7,
    "difficulty_concentrating": 1,
    "academic_emotional_exhaustion": 1,
}
# Within permitted config ranges but beyond observed ranges; raw score > 100.
HIGH_EXTREME = {
    "study_hours_outside_classes_per_day": 16.0,
    "academic_tasks_per_week": 50,
    "academic_workload": 5,
    "time_pressure": 5,
    "avg_sleep_hours": 0.0,
    "wakes_up_tired": 5,
    "physical_activity_days_per_week": 0,
    "difficulty_concentrating": 5,
    "academic_emotional_exhaustion": 5,
}


def _sha256(rel_path: str) -> str:
    return hashlib.sha256((REPO_ROOT / rel_path).read_bytes()).hexdigest()


def _with(base: dict, **overrides) -> dict:
    out = dict(base)
    out.update(overrides)
    return out


@pytest.fixture(scope="module")
def models():
    return get_models()


# 1. Valid inputs ------------------------------------------------------------

def test_mapping_and_dataframe_inputs_agree():
    from_map = predict_student_risk(TYPICAL)
    from_df = predict_student_risk(pd.DataFrame([TYPICAL]))
    assert from_map == from_df
    assert from_map["predicted_risk_level"] in RISK_LEVEL_CLASSES
    assert from_map["schema_version"] == predict_module.SCHEMA_VERSION


def test_decimal_sleep_hours_are_accepted_unrounded():
    result = predict_student_risk(_with(TYPICAL, avg_sleep_hours=6.73))
    assert result["inputs"]["avg_sleep_hours"] == 6.73


def test_integer_valued_floats_and_numpy_scalars_accepted():
    as_floats = {k: float(v) for k, v in TYPICAL.items()}
    as_numpy = {k: np.float64(v) for k, v in TYPICAL.items()}
    assert predict_student_risk(as_floats) == predict_student_risk(TYPICAL)
    assert predict_student_risk(as_numpy) == predict_student_risk(TYPICAL)


# 2-4. Rejections ---------------------------------------------------------------

def test_missing_feature_rejected():
    bad = dict(TYPICAL)
    del bad["avg_sleep_hours"]
    with pytest.raises(PredictionInputError, match="missing required features"):
        predict_student_risk(bad)


@pytest.mark.parametrize(
    "extra_key, extra_value",
    [("burnout_risk_score", 55.0), ("burnout_risk_level", "High"), ("institution", "IIIT Pune"), ("foo", 1)],
)
def test_extra_fields_including_targets_and_profile_rejected(extra_key, extra_value):
    with pytest.raises(PredictionInputError, match="unexpected fields"):
        predict_student_risk(_with(TYPICAL, **{extra_key: extra_value}))


@pytest.mark.parametrize(
    "bad_value",
    [None, float("nan"), float("inf"), float("-inf"), "3", True, [3], np.nan],
)
def test_invalid_values_rejected(bad_value):
    with pytest.raises(PredictionInputError):
        predict_student_risk(_with(TYPICAL, time_pressure=bad_value))


@pytest.mark.parametrize(
    "feature, value",
    [
        ("academic_workload", 0),
        ("academic_workload", 6),
        ("physical_activity_days_per_week", 8),
        ("avg_sleep_hours", -0.1),
        ("avg_sleep_hours", 24.5),
        ("academic_tasks_per_week", 51),
    ],
)
def test_out_of_range_values_rejected(feature, value):
    with pytest.raises(PredictionInputError, match="outside the permitted range"):
        predict_student_risk(_with(TYPICAL, **{feature: value}))


def test_non_integer_for_integer_feature_rejected():
    with pytest.raises(PredictionInputError, match="whole number"):
        predict_student_risk(_with(TYPICAL, wakes_up_tired=3.5))


def test_bad_containers_rejected():
    with pytest.raises(PredictionInputError, match="exactly 1 row"):
        predict_student_risk(pd.DataFrame([TYPICAL, TYPICAL]))
    with pytest.raises(PredictionInputError, match="Unsupported input type"):
        predict_student_risk([list(TYPICAL.values())])
    with pytest.raises(PredictionInputError, match="exactly 1 row"):
        predict_student_risk(pd.DataFrame(columns=FEATURE_COLUMNS))


def test_error_type_is_catchable_as_value_error():
    assert issubclass(PredictionInputError, DataValidationError)
    assert issubclass(PredictionInputError, ValueError)


def test_extrapolation_warnings_are_reported_not_blocking():
    assert predict_student_risk(TYPICAL)["input_warnings"] == []
    warnings = predict_student_risk(HIGH_EXTREME)["input_warnings"]
    assert len(warnings) == 3
    assert any("avg_sleep_hours" in w for w in warnings)


# 5. Feature order ----------------------------------------------------------------

def test_saved_pipelines_were_fitted_on_configured_feature_order(models):
    lr, reg = models
    assert list(lr.named_steps["scaler"].feature_names_in_) == FEATURE_COLUMNS
    assert list(reg.named_steps["scaler"].feature_names_in_) == FEATURE_COLUMNS


def test_input_key_order_does_not_change_result():
    shuffled = {k: TYPICAL[k] for k in reversed(FEATURE_COLUMNS)}
    assert predict_student_risk(shuffled) == predict_student_risk(TYPICAL)
    assert list(predict_student_risk(shuffled)["inputs"]) == FEATURE_COLUMNS


# 6. Artifacts load without retraining ------------------------------------------

def test_prediction_never_calls_fit(monkeypatch):
    def _forbidden(*args, **kwargs):
        raise AssertionError("fit() must not be called during prediction")

    monkeypatch.setattr(Pipeline, "fit", _forbidden)
    monkeypatch.setattr(LogisticRegression, "fit", _forbidden)
    monkeypatch.setattr(Ridge, "fit", _forbidden)
    predict_module._load_default_models.cache_clear()
    try:
        predict_student_risk(TYPICAL)
    finally:
        predict_module._load_default_models.cache_clear()


# 7. Probabilities ---------------------------------------------------------------

@pytest.mark.parametrize("case", [TYPICAL, LOW_OBSERVED, HIGH_EXTREME])
def test_probabilities_map_to_correct_labels(models, case):
    lr, _ = models
    result = predict_student_risk(case)
    probs = result["class_probabilities"]
    assert list(probs) == RISK_LEVEL_CLASSES
    assert sum(probs.values()) == pytest.approx(1.0, abs=1e-9)

    x = pd.DataFrame([case], columns=FEATURE_COLUMNS).astype("float64")
    expected = dict(zip(lr.named_steps["classifier"].classes_, lr.predict_proba(x)[0]))
    for cls in RISK_LEVEL_CLASSES:
        assert probs[cls] == pytest.approx(expected[cls], abs=1e-12)
    assert result["predicted_risk_level"] == max(probs, key=probs.get)
    assert result["predicted_risk_level"] == lr.predict(x)[0]


# 8. JSON-friendliness -------------------------------------------------------------

def _walk(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            assert isinstance(k, str)
            yield from _walk(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _walk(v)
    else:
        yield obj


@pytest.mark.parametrize("case", [TYPICAL, LOW_OBSERVED, HIGH_EXTREME])
def test_output_is_strict_json(case):
    result = predict_student_risk(case)
    json.dumps(result, allow_nan=False)
    for leaf in _walk(result):
        assert type(leaf) in (str, float, int, bool), f"non-native type {type(leaf)}"
        if isinstance(leaf, float):
            assert math.isfinite(leaf)


def test_top_level_schema_keys():
    assert set(predict_student_risk(TYPICAL)) == {
        "schema_version", "inputs", "predicted_risk_level", "class_probabilities",
        "raw_risk_score", "display_risk_score", "score_was_bounded",
        "classifier_explanation", "score_explanation", "input_warnings",
        "model_artifacts", "disclaimer",
    }


# 9-11. Raw / display score -------------------------------------------------------

@pytest.mark.parametrize(
    "case, expect_bounded, expect_display",
    [(TYPICAL, False, None), (LOW_OBSERVED, True, DISPLAY_SCORE_MIN), (HIGH_EXTREME, True, DISPLAY_SCORE_MAX)],
)
def test_raw_and_display_scores(models, case, expect_bounded, expect_display):
    _, reg = models
    result = predict_student_risk(case)
    x = pd.DataFrame([case], columns=FEATURE_COLUMNS).astype("float64")
    assert result["raw_risk_score"] == float(reg.predict(x)[0])  # exact, unrounded
    assert DISPLAY_SCORE_MIN <= result["display_risk_score"] <= DISPLAY_SCORE_MAX
    assert result["score_was_bounded"] is expect_bounded
    if expect_bounded:
        assert result["display_risk_score"] == expect_display
        assert result["raw_risk_score"] != result["display_risk_score"]
    else:
        assert result["display_risk_score"] == result["raw_risk_score"]


def test_low_observed_case_really_is_negative_raw():
    assert predict_student_risk(LOW_OBSERVED)["raw_risk_score"] < 0


def test_bound_display_score_edges():
    assert bound_display_score(0.0) == (0.0, False)
    assert bound_display_score(100.0) == (100.0, False)
    assert bound_display_score(-4.6415) == (0.0, True)
    assert bound_display_score(100.0001) == (100.0, True)


# 12. Ridge reconstruction ---------------------------------------------------------

@pytest.mark.parametrize("case", [TYPICAL, LOW_OBSERVED, HIGH_EXTREME])
def test_ridge_contributions_reconstruct_raw_score(case):
    result = predict_student_risk(case)
    se = result["score_explanation"]
    total = se["intercept"] + sum(c["contribution"] for c in se["contributions"])
    assert total == pytest.approx(result["raw_risk_score"], abs=predict_module.RECONSTRUCTION_TOLERANCE)
    assert se["raw_risk_score"] == result["raw_risk_score"]
    assert {c["feature"] for c in se["contributions"]} == set(FEATURE_COLUMNS)
    assert [c["rank"] for c in se["contributions"]] == list(range(1, 10))


# 13. Classifier explanation -------------------------------------------------------

@pytest.mark.parametrize("case", [TYPICAL, LOW_OBSERVED, HIGH_EXTREME])
def test_classifier_contributions_belong_to_predicted_class(models, case):
    lr, _ = models
    result = predict_student_risk(case)
    ce = result["classifier_explanation"]
    assert ce["explained_class"] == result["predicted_risk_level"]

    clf = lr.named_steps["classifier"]
    idx = list(clf.classes_).index(ce["explained_class"])
    x = pd.DataFrame([case], columns=FEATURE_COLUMNS).astype("float64")
    z = lr.named_steps["scaler"].transform(x)[0]

    by_feature = {c["feature"]: c for c in ce["contributions"]}
    for j, feat in enumerate(FEATURE_COLUMNS):
        assert by_feature[feat]["coefficient"] == pytest.approx(clf.coef_[idx, j], abs=1e-12)
        assert by_feature[feat]["contribution"] == pytest.approx(clf.coef_[idx, j] * z[j], abs=1e-12)

    logit = clf.decision_function(z.reshape(1, -1))[0][idx]
    total = ce["intercept_logit"] + sum(c["contribution"] for c in ce["contributions"])
    assert total == pytest.approx(logit, abs=predict_module.RECONSTRUCTION_TOLERANCE)
    assert ce["class_logit"] == pytest.approx(logit, abs=1e-12)
    assert "not direct changes in probability" in ce["note"]


def test_direction_labels_match_sign():
    for exp_key in ("classifier_explanation", "score_explanation"):
        for c in predict_student_risk(HIGH_EXTREME)[exp_key]["contributions"]:
            expected = "increases" if c["contribution"] > 0 else "decreases" if c["contribution"] < 0 else "neutral"
            assert c["direction"] == expected


def test_disclaimer_present():
    assert "synthetic" in predict_student_risk(TYPICAL)["disclaimer"].lower()
    assert "not a clinical" in predict_student_risk(TYPICAL)["disclaimer"]


# Explainability backward compatibility ------------------------------------------

def test_explainability_default_rounding_unchanged():
    rounded = explain_individual_prediction(TYPICAL)
    full = explain_individual_prediction(TYPICAL, round_digits=None)
    raw = full["predictions"]["predicted_burnout_score"]
    assert rounded["predictions"]["predicted_burnout_score"] == round(raw, 4)
    assert rounded["predictions"]["predicted_burnout_score"] != raw


# 14. No mutation ------------------------------------------------------------------

def test_protected_artifacts_unchanged_by_predictions():
    before = {p: _sha256(p) for p in PROTECTED_FILES}
    for case in (TYPICAL, LOW_OBSERVED, HIGH_EXTREME):
        predict_student_risk(case)
    after = {p: _sha256(p) for p in PROTECTED_FILES}
    assert before == after
    for path, digest in EXPECTED_SHA256.items():
        assert after[path] == digest
