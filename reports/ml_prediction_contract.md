# Cognivault AI — ML Prediction Contract (Block 7)

**Audience:** backend/frontend teammates integrating the ML component.
**Module:** [`src/cognivault/predict.py`](../src/cognivault/predict.py) · **Schema version:** `1.0`
**Scope:** Python only. No HTTP routes, database access, or retraining happen here.

> [!IMPORTANT]
> The models were trained and evaluated on a **synthetic** dataset. Outputs measure agreement with synthetic labels and scores. They are **not** clinical assessments, diagnoses, or validated real-world burnout predictions. Show the `disclaimer` field wherever results are displayed.

---

## 1. How to call

```python
# Run with PYTHONPATH=src (or install the package)
from cognivault.predict import predict_student_risk, PredictionInputError

payload = {
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

try:
    result = predict_student_risk(payload)   # dict, JSON-serializable
except PredictionInputError as exc:          # subclass of ValueError
    ...                                      # e.g. return HTTP 422 with str(exc)
```

Signature:

```python
predict_student_risk(input_data, *, lr_pipeline=None, reg_pipeline=None) -> dict
```

- `input_data`: a `dict`/Mapping **or** a one-row `pandas.DataFrame`.
- `lr_pipeline` / `reg_pipeline`: optional, for tests only. By default the saved artifacts are loaded once per process and cached.
- The function is stateless. It never calls `fit()` and never writes files.

## 2. Input fields

You must supply exactly these nine fields. Key order does not matter.

| Field | Type | Permitted range | Whole number? | Range seen in training |
|---|---|---|:---:|---|
| `study_hours_outside_classes_per_day` | number | 0 – 16 | no | 0.5 – 7.0 |
| `academic_tasks_per_week` | number | 0 – 50 | yes | 1 – 17 |
| `academic_workload` | number (Likert) | 1 – 5 | yes | 1 – 5 |
| `time_pressure` | number (Likert) | 1 – 5 | yes | 1 – 5 |
| `avg_sleep_hours` | number | 0 – 24 | no (decimals kept as-is) | 3.5 – 10.0 |
| `wakes_up_tired` | number (Likert) | 1 – 5 | yes | 1 – 5 |
| `physical_activity_days_per_week` | number | 0 – 7 | yes | 0 – 7 |
| `difficulty_concentrating` | number (Likert) | 1 – 5 | yes | 1 – 5 |
| `academic_emotional_exhaustion` | number (Likert) | 1 – 5 | yes | 1 – 5 |

The ranges come from `FEATURE_VALIDATION_RULES` in `src/cognivault/config.py`. For whole-number fields, `3` and `3.0` are both accepted.

## 3. Error behavior

Every invalid input raises `PredictionInputError` with a human-readable message. Nothing is imputed, coerced, or silently dropped.

| Condition | Example message fragment |
|---|---|
| Missing field(s) | `missing required features: [...]` |
| Extra field(s), including targets (`burnout_risk_score`, `burnout_risk_level`) and profile columns (`institution`, …) | `unexpected fields: [...]` |
| Non-numeric value: `None`, string (even `"3"`), bool, list | `must be a real number` |
| NaN / ±infinity | `must be finite` |
| Outside permitted range | `outside the permitted range` |
| Fractional value for a whole-number field | `requires a whole number` |
| Not a Mapping/DataFrame, or a DataFrame without exactly 1 row | `Unsupported input type` / `exactly 1 row` |

If a value is valid but **outside the range seen in training**, the call still succeeds. A notice is added to `input_warnings` because the models are extrapolating.

`RuntimeError` is reserved for internal consistency failures, such as an explanation that does not reconstruct the prediction. This should never happen with the shipped artifacts. If it does, treat it as a server error (HTTP 500).

## 4. Output schema (v1.0)

```text
{
  "schema_version":       "1.0",
  "inputs":               {<feature>: float, ...}            # validated values, configured order
  "predicted_risk_level": "Low" | "Moderate" | "High" | "Critical"
  "class_probabilities":  {"Low": float, "Moderate": float, "High": float, "Critical": float}  # sum ≈ 1
  "raw_risk_score":       float    # exact Ridge output; may fall below 0 or above 100
  "display_risk_score":   float    # raw score clamped to [0, 100]
  "score_was_bounded":    bool     # True iff display_risk_score != raw_risk_score
  "classifier_explanation": {
      "method": "logistic_regression_logit_contributions",
      "explained_class": str,          # always equals predicted_risk_level
      "intercept_logit": float,
      "class_logit": float,            # intercept_logit + sum(contributions)
      "contributions": [ContributionRow x 9],
      "reconstruction_error": float,
      "note": str
  },
  "score_explanation": {
      "method": "ridge_additive_contributions",
      "intercept": float,
      "contributions": [ContributionRow x 9],
      "raw_risk_score": float,         # intercept + sum(contributions)
      "reconstruction_error": float,
      "display_transformation": {"rule": "clamp", "bounds": [0.0, 100.0],
                                 "display_risk_score": float, "score_was_bounded": bool},
      "note": str
  },
  "input_warnings":  [str, ...],       # empty list when inputs lie within the training range
  "model_artifacts": {"classifier": "models/logistic_regression/lr_final_model.joblib",
                      "regressor":  "models/regression/regression_final_model.joblib"},
  "disclaimer": str
}

ContributionRow = {
  "feature": str, "input_value": float,
  "standardized_value": float,   # (x - training mean) / training std, from the saved scaler
  "coefficient": float,          # per 1 standard deviation
  "contribution": float,         # coefficient * standardized_value
  "direction": "increases" | "decreases" | "neutral",
  "rank": int                    # 1 = largest |contribution|; ties broken by configured feature order
}
```

All values are native Python `str`/`float`/`int`/`bool`/`list`/`dict`, with no NaN or infinity. `json.dumps(result, allow_nan=False)` succeeds. Numbers are **not rounded**, so round them in the UI as needed.

### Real output for the example payload above (abridged, rounded here for readability)

| Field | Value |
|---|---|
| `predicted_risk_level` | `Moderate` |
| `class_probabilities` | Low 0.0003 · Moderate 0.5080 · High 0.4915 · Critical 0.0003 |
| `raw_risk_score` / `display_risk_score` | 49.7505 / 49.7505 |
| `score_was_bounded` | `false` |

## 5. Raw vs display score

- `raw_risk_score` is the unmodified Ridge prediction. This is the value the reported metrics describe (test MAE 3.30, RMSE 4.21, R² 0.952).
- `display_risk_score = min(max(raw, 0), 100)` is a **presentation rule only**. It is never fed back into either model and does not change the predicted risk level.
- Ridge is linear, so raw scores can leave the 0–100 range. One of the 400 held-out predictions was −4.64. Inputs *within* the training ranges can also do this: the all-minimum-burnout profile gives a raw score of about −7.35, displayed as 0.
- `score_explanation.contributions` explain the **raw** score: `intercept + Σ contributions = raw_risk_score` within 1e-8. They do not add up to a clamped display value.

## 6. Interpreting explanations

- **Score explanation:** each contribution is the number of score points this feature moves the raw prediction away from the training-average baseline (`intercept` ≈ 44.90).
- **Classifier explanation:** contributions are additive terms of the predicted class's **logit (log-odds score)**. They are **not** changes in probability. Probabilities come from a softmax across all four class logits, so a feature's effect on probability also depends on the other classes.
- Both describe how these models combine inputs. They are **not causal effects** and not advice.

## 7. Known limitations

1. **Synthetic data.** No real-world or clinical validity has been established.
2. **The two models are independent.** The risk level comes from the classifier and the score from the regressor, and they can disagree near band edges. For example, the example payload is classified `Moderate` (50.8 % vs 49.2 % High) with a score of 49.75. The label implied by the score bands (<30 Low, 30–50 Moderate, 50–70 High, ≥70 Critical) may therefore differ from `predicted_risk_level`. Neither output is adjusted to match the other. Decide in the UI how to present close calls; showing the probabilities is recommended.
3. **Extrapolation.** Inputs outside the training ranges are accepted but flagged in `input_warnings`. Predictions there are less reliable.
4. **Classification accuracy.** On held-out data, High-class recall was 77.4 %. The most common confusions are between adjacent tiers.

## 8. Artifacts and tests

| Item | Path |
|---|---|
| Classifier | `models/logistic_regression/lr_final_model.joblib` (StandardScaler → LogisticRegression) |
| Regressor | `models/regression/regression_final_model.joblib` (StandardScaler → Ridge α=1.0) |
| Explanation engine | `src/cognivault/explainability.py` |
| Tests | `tests/test_predict.py` (run `python -m pytest -v`) |
