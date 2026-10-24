# Backend Integration Guide — Cognivault ML Model

This guide explains how the backend team (FastAPI, Flask, Node.js) loads and uses the project's selected **Logistic Regression** burnout risk classifier.

---

## 📌 1. Short Summary

- **Selected Model:** **Logistic Regression** (`StandardScaler` + `LogisticRegression(class_weight='balanced')`)
- **Model File:** `models/logistic_regression_model.joblib` (Ultra-lightweight: **~2 KB**)
- **Input:** Exactly **9 student survey features** (numbers only; no demographic fields).
- **Primary Output:** `burnout_risk_level` (`"Low"`, `"Moderate"`, `"High"`, or `"Critical"`).
- **Secondary Output:** Class probabilities (e.g., `{"Low": 0.00, "Moderate": 0.05, "High": 0.25, "Critical": 0.70}`).
- **Model Confidence:** Probability of the predicted winning class (e.g., `0.70`).

### 💡 Why Logistic Regression was selected:
1. **High Macro F1:** Achieved **84.1% on held-out test data** (and **86.6% in 5-fold cross-validation**).
2. **Top-Tier Critical Burnout Detection:** Has a **90.9% recall on Critical risk** (catches over 9 out of 10 students in severe burnout).
3. **Built-in Normalization:** `StandardScaler` is bundled directly inside the scikit-learn Pipeline, meaning the backend does **not** need to normalize features manually.
4. **Ultra-Lightweight:** Loads instantly into memory in < 1 millisecond.

---

## 📥 2. Expected Input Features (Request Payload)

The backend passes these **9 features** as a dictionary:

| Feature Name | Type | Valid Range | Description |
|---|:---:|:---:|---|
| `study_hours_outside_classes_per_day` | float | 0.0 – 12.0 | Daily study hours outside class |
| `academic_tasks_per_week` | int | 0 – 25 | Count of weekly assignments/tasks |
| `academic_workload` | int | 1 – 5 | Self-rated academic workload |
| `time_pressure` | int | 1 – 5 | Perceived urgency/deadline stress |
| `avg_sleep_hours` | float | 3.0 – 10.0 | Daily hours of sleep |
| `wakes_up_tired` | int | 1 – 5 | Morning fatigue score |
| `physical_activity_days_per_week` | int | 0 – 7 | Active days per week (>= 30 mins) |
| `difficulty_concentrating` | int | 1 – 5 | Inability to focus rating |
| `academic_emotional_exhaustion` | int | 1 – 5 | Mental/emotional exhaustion score |

> ⚠️ **Note:** Demographic fields (`institution`, `branch`, `year`, `degree`, `student_id`) are intentionally excluded to prevent bias and keep the model focused strictly on lifestyle habits.

---

## 📤 3. Outputs Produced by the Model

1. **`burnout_risk_level` (String):**
   - `"Low"` (Mild stress, healthy balance)
   - `"Moderate"` (Manageable strain, monitor workload)
   - `"High"` (Elevated burnout risk, habit intervention recommended)
   - `"Critical"` (Severe burnout indicators, immediate support needed)

2. **`confidence` (Float, 0.0 – 1.0):**
   - Probability of the predicted class (e.g., `0.8712`).

3. **`probabilities` (Dictionary):**
   - Exact breakdown across all 4 tiers in natural order:
     ```json
     {
       "Low": 0.0000,
       "Moderate": 0.0001,
       "High": 0.1288,
       "Critical": 0.8711
     }
     ```

---

## 💻 4. Backend Implementation (FastAPI Example)

### Method 1: Using the built-in helper function (1 line of code)
```python
from cognivault.predict import predict_burnout_risk

student_survey = {
    "study_hours_outside_classes_per_day": 5.0,
    "academic_tasks_per_week": 14,
    "academic_workload": 4,
    "time_pressure": 5,
    "avg_sleep_hours": 4.5,
    "wakes_up_tired": 4,
    "physical_activity_days_per_week": 1,
    "difficulty_concentrating": 4,
    "academic_emotional_exhaustion": 5,
}

result = predict_burnout_risk(student_survey)
print(result)
```

---

### Method 2: FastAPI Endpoint (Copy-paste ready)
```python
import joblib
import pandas as pd
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Cognivault Burnout Risk Inference API")

# Load model once at startup (StandardScaler + LogisticRegression Pipeline)
MODEL_PATH = Path("models/logistic_regression_model.joblib")
model = joblib.load(MODEL_PATH)

FEATURE_COLUMNS = [
    "study_hours_outside_classes_per_day",
    "academic_tasks_per_week",
    "academic_workload",
    "time_pressure",
    "avg_sleep_hours",
    "wakes_up_tired",
    "physical_activity_days_per_week",
    "difficulty_concentrating",
    "academic_emotional_exhaustion",
]

RISK_ORDER = ["Low", "Moderate", "High", "Critical"]

# Request Schema
class StudentSurveyInput(BaseModel):
    study_hours_outside_classes_per_day: float = Field(..., ge=0.0, le=12.0)
    academic_tasks_per_week: int = Field(..., ge=0, le=25)
    academic_workload: int = Field(..., ge=1, le=5)
    time_pressure: int = Field(..., ge=1, le=5)
    avg_sleep_hours: float = Field(..., ge=3.0, le=10.0)
    wakes_up_tired: int = Field(..., ge=1, le=5)
    physical_activity_days_per_week: int = Field(..., ge=0, le=7)
    difficulty_concentrating: int = Field(..., ge=1, le=5)
    academic_emotional_exhaustion: int = Field(..., ge=1, le=5)

@app.post("/api/predict-burnout")
def predict_burnout(survey: StudentSurveyInput):
    # 1. Arrange input into DataFrame in exact feature order
    input_df = pd.DataFrame([survey.dict()])[FEATURE_COLUMNS]

    # 2. Predict class (Pipeline handles StandardScaler internally)
    predicted_level = model.predict(input_df)[0]

    # 3. Predict class probabilities
    raw_probas = model.predict_proba(input_df)[0]
    proba_map = dict(zip(model.classes_, raw_probas))
    
    probabilities = {
        level: round(float(proba_map.get(level, 0.0)), 4)
        for level in RISK_ORDER
    }
    confidence = probabilities[predicted_level]

    # 4. Return clean JSON response
    return {
        "status": "success",
        "model_used": "LogisticRegression",
        "burnout_risk_level": predicted_level,
        "confidence": confidence,
        "probabilities": probabilities
    }
```

---

## 📋 5. Sample Request & Response

### Request (`POST /api/predict-burnout`):
```json
{
  "study_hours_outside_classes_per_day": 5.0,
  "academic_tasks_per_week": 14,
  "academic_workload": 4,
  "time_pressure": 5,
  "avg_sleep_hours": 4.5,
  "wakes_up_tired": 4,
  "physical_activity_days_per_week": 1,
  "difficulty_concentrating": 4,
  "academic_emotional_exhaustion": 5
}
```

### Response:
```json
{
  "status": "success",
  "model_used": "LogisticRegression",
  "burnout_risk_level": "Critical",
  "confidence": 0.8711,
  "probabilities": {
    "Low": 0.0000,
    "Moderate": 0.0001,
    "High": 0.1288,
    "Critical": 0.8711
  }
}
```
