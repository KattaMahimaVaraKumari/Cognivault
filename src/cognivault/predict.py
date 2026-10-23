"""Unified prediction interface for Cognivault AI (Block 7).

Combines the two saved, already-evaluated models and the existing explainability
layer behind one framework-independent function:

    from cognivault.predict import predict_student_risk
    result = predict_student_risk({...nine features...})

- Classifier: ``models/logistic_regression/lr_final_model.joblib``
  (StandardScaler -> LogisticRegression) -> risk level + class probabilities.
- Regressor:  ``models/regression/regression_final_model.joblib``
  (StandardScaler -> Ridge) -> continuous 0-100 risk score.

No model is trained, tuned, or re-evaluated here. Artifacts are loaded read-only.

The two models are independent: the predicted risk level comes only from the
classifier, and the score only from the regressor. They can occasionally disagree
(e.g. level "High" with a score just under 50). Neither output is adjusted to
match the other.

All outputs reflect models fitted to a synthetic dataset; they are not clinical
assessments or diagnoses.
"""

from __future__ import annotations

import math
import numbers
from collections.abc import Mapping
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

from cognivault.config import (
    FEATURE_COLUMNS,
    FEATURE_VALIDATION_RULES,
    REPO_ROOT,
    RISK_LEVEL_CLASSES,
    SCORE_VALIDATION_RULE,
)
from cognivault.data import DataValidationError
from cognivault.explainability import (
    MODELS_LR_PATH,
    MODELS_REG_PATH,
    explain_individual_prediction,
    load_explainability_models,
)

SCHEMA_VERSION: str = "1.0"

#: Display-score bounds (inclusive). Raw model output is never modified.
DISPLAY_SCORE_MIN: float = float(SCORE_VALIDATION_RULE["min"])
DISPLAY_SCORE_MAX: float = float(SCORE_VALIDATION_RULE["max"])

#: Max allowed |prediction - (intercept + sum(contributions))| before we refuse to answer.
RECONSTRUCTION_TOLERANCE: float = 1e-8

DISCLAIMER: str = (
    "This output reflects models trained on synthetic data and is not a clinical "
    "assessment, diagnosis, or validated real-world burnout prediction. Feature "
    "contributions describe how these models combined the inputs; they are not "
    "causal effects."
)


class PredictionInputError(DataValidationError):
    """Raised when prediction input is missing, malformed, non-numeric, or out of range.

    Subclass of ``DataValidationError`` (and therefore ``ValueError``), so callers can
    catch a single exception type and map it to e.g. an HTTP 422 response.
    """


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _load_default_models() -> Tuple[Pipeline, Pipeline]:
    """Load the saved classifier and regressor once per process (read-only)."""
    return load_explainability_models()


def get_models() -> Tuple[Pipeline, Pipeline]:
    """Return ``(classifier_pipeline, regressor_pipeline)`` loaded from saved artifacts."""
    return _load_default_models()


# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

def _to_feature_mapping(input_data: Any) -> Dict[str, Any]:
    """Normalize a Mapping or one-row DataFrame into a plain ``{column: value}`` dict."""
    if isinstance(input_data, pd.DataFrame):
        if len(input_data) != 1:
            raise PredictionInputError(
                f"DataFrame input must contain exactly 1 row, got {len(input_data)}."
            )
        if input_data.columns.duplicated().any():
            dupes = input_data.columns[input_data.columns.duplicated()].tolist()
            raise PredictionInputError(f"Duplicate column names: {dupes}")
        return {str(col): input_data.iloc[0][col] for col in input_data.columns}
    if isinstance(input_data, Mapping):
        return {str(key): value for key, value in input_data.items()}
    raise PredictionInputError(
        f"Unsupported input type {type(input_data).__name__}; "
        "provide a mapping (dict) or a one-row pandas DataFrame."
    )


def _validate_value(feature: str, value: Any) -> Tuple[float, Optional[str]]:
    """Validate a single feature value; return (float_value, optional_warning)."""
    # bool is a subclass of int; reject it explicitly. Strings are never coerced.
    if isinstance(value, (bool, np.bool_)) or not isinstance(value, numbers.Real):
        raise PredictionInputError(
            f"Feature '{feature}' must be a real number, got {type(value).__name__} ({value!r})."
        )
    fval = float(value)
    if not math.isfinite(fval):
        raise PredictionInputError(f"Feature '{feature}' must be finite, got {value!r}.")

    rule = FEATURE_VALIDATION_RULES[feature]
    if fval < rule["min"] or fval > rule["max"]:
        raise PredictionInputError(
            f"Feature '{feature}' = {value!r} is outside the permitted range "
            f"[{rule['min']}, {rule['max']}]."
        )
    if rule["must_be_integer"] and not fval.is_integer():
        raise PredictionInputError(
            f"Feature '{feature}' requires a whole number, got {value!r}."
        )

    warning = None
    if fval < rule["observed_min"] or fval > rule["observed_max"]:
        warning = (
            f"'{feature}' = {value!r} is outside the range seen in training data "
            f"[{rule['observed_min']}, {rule['observed_max']}]; the models are extrapolating."
        )
    return fval, warning


def validate_prediction_input(input_data: Any) -> Tuple[pd.DataFrame, List[str]]:
    """Validate raw input and build the model-ready feature frame.

    Returns:
        ``(features_df, warnings)`` where ``features_df`` is a one-row float64 DataFrame
        with columns exactly ``FEATURE_COLUMNS`` in configured order, and ``warnings``
        lists non-blocking notices (e.g. values outside the observed training range).

    Raises:
        PredictionInputError: on any missing/extra field, wrong type, non-finite value,
            out-of-range value, or non-integer value for an integer feature.
    """
    mapping = _to_feature_mapping(input_data)

    missing = [f for f in FEATURE_COLUMNS if f not in mapping]
    extra = sorted(k for k in mapping if k not in FEATURE_COLUMNS)
    if missing or extra:
        parts = []
        if missing:
            parts.append(f"missing required features: {missing}")
        if extra:
            parts.append(f"unexpected fields: {extra}")
        raise PredictionInputError(
            "Input must contain exactly the 9 configured features; " + "; ".join(parts) + "."
        )

    values: Dict[str, float] = {}
    warnings: List[str] = []
    for feature in FEATURE_COLUMNS:
        fval, warning = _validate_value(feature, mapping[feature])
        values[feature] = fval
        if warning:
            warnings.append(warning)

    features_df = pd.DataFrame([[values[f] for f in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS, dtype="float64")
    return features_df, warnings


# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

def bound_display_score(raw_score: float) -> Tuple[float, bool]:
    """Clamp a raw score to [DISPLAY_SCORE_MIN, DISPLAY_SCORE_MAX] for display only.

    Returns ``(display_score, was_bounded)``. This is a presentation rule: it does not
    change the raw prediction, the classifier output, or reported model accuracy.
    """
    display = min(max(raw_score, DISPLAY_SCORE_MIN), DISPLAY_SCORE_MAX)
    return float(display), bool(display != raw_score)


def _direction(contribution: float) -> str:
    if contribution > 0:
        return "increases"
    if contribution < 0:
        return "decreases"
    return "neutral"


def _contribution_rows(raw_rows: List[Dict[str, Any]], value_key: str) -> List[Dict[str, Any]]:
    """Convert explainability rows into the stable public schema, ranked by |contribution|."""
    rows = [
        {
            "feature": r["feature"],
            "input_value": float(r["input_value"]),
            "standardized_value": float(r["standardized_z_score"]),
            "coefficient": float(r["coefficient"]),
            "contribution": float(r[value_key]),
            "direction": _direction(float(r[value_key])),
        }
        for r in raw_rows
    ]
    # Stable ranking: |contribution| descending, ties broken by configured feature order.
    order = {f: i for i, f in enumerate(FEATURE_COLUMNS)}
    rows.sort(key=lambda r: (-abs(r["contribution"]), order[r["feature"]]))
    for rank, row in enumerate(rows, start=1):
        row["rank"] = rank
    return rows


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def predict_student_risk(
    input_data: Any,
    *,
    lr_pipeline: Optional[Pipeline] = None,
    reg_pipeline: Optional[Pipeline] = None,
) -> Dict[str, Any]:
    """Predict burnout-risk level, 0-100 score, and model explanations for one student.

    Args:
        input_data: A mapping (e.g. ``dict``) or one-row ``pandas.DataFrame`` containing
            exactly the nine configured features (see ``FEATURE_COLUMNS``). No other
            keys/columns are accepted. Values must be real numbers (not strings/bools),
            finite, within ``FEATURE_VALIDATION_RULES`` ranges, and whole numbers for
            integer features. Key order does not matter; the configured order is used.
        lr_pipeline: Optional preloaded classifier pipeline (defaults to saved artifact).
        reg_pipeline: Optional preloaded regressor pipeline (defaults to saved artifact).

    Returns:
        JSON-serializable dict following schema version ``SCHEMA_VERSION`` (documented
        in ``reports/ml_prediction_contract.md``).

    Raises:
        PredictionInputError: for any invalid input (nothing is imputed or coerced).
        RuntimeError: if an internal consistency check fails (should never happen with
            the shipped artifacts).
    """
    features_df, input_warnings = validate_prediction_input(input_data)

    if lr_pipeline is None or reg_pipeline is None:
        default_lr, default_reg = get_models()
        lr_pipeline = lr_pipeline or default_lr
        reg_pipeline = reg_pipeline or default_reg

    exp = explain_individual_prediction(
        features_df, lr_pipeline=lr_pipeline, reg_pipeline=reg_pipeline, round_digits=None
    )

    # --- Classification -----------------------------------------------------
    clf = lr_pipeline.named_steps["classifier"]
    model_classes = [str(c) for c in clf.classes_]
    if sorted(model_classes) != sorted(RISK_LEVEL_CLASSES):
        raise RuntimeError(f"Classifier classes {model_classes} do not match {RISK_LEVEL_CLASSES}.")
    probabilities = {cls: float(exp["predictions"]["class_probabilities"][cls]) for cls in RISK_LEVEL_CLASSES}
    predicted_level = str(exp["predictions"]["predicted_risk_level"])
    clf_exp = exp["classifier_explanation"]
    if clf_exp["reconstruction_difference"] > RECONSTRUCTION_TOLERANCE:
        raise RuntimeError("Classifier logit reconstruction failed tolerance check.")

    # --- Regression ---------------------------------------------------------
    score_exp = exp["score_explanation"]
    raw_score = float(exp["predictions"]["predicted_burnout_score"])
    if score_exp["reconstruction_difference"] > RECONSTRUCTION_TOLERANCE:
        raise RuntimeError("Ridge score reconstruction failed tolerance check.")
    display_score, was_bounded = bound_display_score(raw_score)

    score_rows = _contribution_rows(score_exp["contributions"], "contribution_points")
    logit_rows = _contribution_rows(clf_exp["contributions"], "contribution_logit")

    return {
        "schema_version": SCHEMA_VERSION,
        "inputs": {f: float(features_df.iloc[0][f]) for f in FEATURE_COLUMNS},
        "predicted_risk_level": predicted_level,
        "class_probabilities": probabilities,
        "raw_risk_score": raw_score,
        "display_risk_score": display_score,
        "score_was_bounded": was_bounded,
        "classifier_explanation": {
            "method": "logistic_regression_logit_contributions",
            "explained_class": predicted_level,
            "intercept_logit": float(clf_exp["base_intercept_logit"]),
            "class_logit": float(clf_exp["actual_model_logit"]),
            "contributions": logit_rows,
            "reconstruction_error": float(clf_exp["reconstruction_difference"]),
            "note": (
                f"Each contribution is coefficient x standardized input for the predicted class "
                f"'{predicted_level}'. Contributions add to that class's logit (log-odds score); "
                "they are not direct changes in probability. Probabilities come from a softmax "
                "over all four class logits."
            ),
        },
        "score_explanation": {
            "method": "ridge_additive_contributions",
            "intercept": float(score_exp["base_intercept_score"]),
            "contributions": score_rows,
            "raw_risk_score": raw_score,
            "reconstruction_error": float(score_exp["reconstruction_difference"]),
            "display_transformation": {
                "rule": "clamp",
                "bounds": [DISPLAY_SCORE_MIN, DISPLAY_SCORE_MAX],
                "display_risk_score": display_score,
                "score_was_bounded": was_bounded,
            },
            "note": (
                "intercept + sum(contributions) equals raw_risk_score (score points). "
                "display_risk_score is raw_risk_score clamped to [0, 100] for presentation "
                "only; contributions explain the raw score, not the clamped value."
            ),
        },
        "input_warnings": input_warnings,
        "model_artifacts": {
            "classifier": MODELS_LR_PATH.relative_to(REPO_ROOT).as_posix(),
            "regressor": MODELS_REG_PATH.relative_to(REPO_ROOT).as_posix(),
        },
        "disclaimer": DISCLAIMER,
    }
