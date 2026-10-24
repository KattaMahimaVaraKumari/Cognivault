# Backend Integration Guide — Cognivault ML Model

This guide explains what outputs our trained Random Forest model produces and how the backend team (FastAPI, Flask, Node.js) can easily load the model and extract predictions.

---

## 📌 1. Short Summary

- **Model File:** `models/random_forest_model.joblib` (~5.1 MB)
- **Input:** Exactly **9 student survey features** (numbers only, no demographic fields).
- **Primary Output:** `burnout_risk_level` (`"Low"`, `"Moderate"`, `"High"`, or `"Critical"`).
- **Secondary Output:** Class probabilities (e.g., `{"Low": 0.05, "Moderate": 0.20, "High": 0.65, "Critical": 0.10}`).
- **Model Confidence:** The probability of the predicted winning class (e.g., `65%`).

---

## 📥 2. Expected Input Features (Request Payload)

The backend must provide these **9 features** in a dictionary or JSON object:

| Feature Name | Type | Valid Range | Description |
|---|:---:|:---:|---|
| `study_hours_outside_classes_per_day` | float | 0.0 – 12.0 | Daily study hours outside lectures |
| `academic_tasks_per_week` | int | 0 – 25 | Count of weekly assignments/tasks |
| `academic_workload` | int | 1 – 5 | Self-rated workload rating |
| `time_pressure` | int | 1 – 5 | Perceived urgency/deadline stress |
| `avg_sleep_hours` | float | 3.0 – 10.0 | Daily hours of sleep |
| `wakes_up_tired` | int | 1 – 5 | Morning fatigue score |
| `physical_activity_days_per_week` | int | 0 – 7 | Active days per week (>= 30 mins) |
| `difficulty_concentrating` | int | 1 – 5 | Inability to focus rating |
| `academic_emotional_exhaustion` | int | 1 – 5 | Mental/emotional exhaustion score |

> ⚠️ **Note:** Demographic fields (`institution`, `branch`, `year`, `degree`, `student_id`) are intentionally **not** passed into the model.

---

## 📤 3. Outputs Produced by the Model

When the backend queries the model, it extracts:

1. **`burnout_risk_level` (String):**
   - `"Low"` (Mild stress, healthy balance)
   - `"Moderate"` (Manageable strain, monitor workload)
   - `"High"` (Elevated burnout risk, habit intervention recommended)
   - `"Critical"` (Severe burnout indicators, immediate support needed)

2. **`confidence` (Float, 0.0 – 1.0):**
   - The model's probability for the selected category (e.g., `0.72` = 72% confidence).

3. **`probabilities` (Dictionary):**
   - Breakdown across all 4 tiers:
     ```json
     {
       "Low": 0.03,
       "Moderate": 0.15,
       "High": 0.72,
       "Critical": 0.10
     }
     ```

4. **`top_risk_factors` (List of Strings - Optional Guidance):**
   - Identifies high-risk trigger habits (e.g., sleep < 6 hrs, exhaustion >= 4) to display personalized tips on the frontend dashboard.

---

## 💻 4. How to Extract in Python Backend (FastAPI Example)

Here is a clean, production-ready snippet for the backend engineer:

```python
import joblib
import pandas as pd
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Cognivault AI Inference API")

# Load model once at startup
MODEL_PATH = Path("models/random_forest_model.joblib")
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
    # 1. Convert input to DataFrame in the exact feature order
    input_data = pd.DataFrame([survey.dict()])[FEATURE_COLUMNS]

    # 2. Extract predicted class
    predicted_level = model.predict(input_data)[0]

    # 3. Extract probabilities for all classes
    raw_probas = model.predict_proba(input_data)[0]
    proba_map = dict(zip(model.classes_, raw_probas))
    
    # 4. Format probabilities in Low -> Critical order
    probabilities = {
        level: round(float(proba_map.get(level, 0.0)), 4)
        for level in RISK_ORDER
    }
    
    confidence = probabilities[predicted_level]

    # 5. Return clean JSON response to Frontend
    return {
        "status": "success",
        "burnout_risk_level": predicted_level,
        "confidence": confidence,
        "probabilities": probabilities
    }
```

---

## 📋 5. Sample JSON Request & Response

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
  "burnout_risk_level": "Critical",
  "confidence": 0.68,
  "probabilities": {
    "Low": 0.01,
    "Moderate": 0.07,
    "High": 0.24,
    "Critical": 0.68
  }
}
```

---

## 🛡️ Error Handling Best Practices for Backend

1. **Input Validation:** Reject requests with missing survey fields or values out of bounds (e.g. sleep > 24 hrs or workload > 5).
2. **Order Preservation:** Always pass columns to `model.predict()` matching `model.feature_names_in_`.
3. **No Retraining:** The backend should **only** call `.predict()` and `.predict_proba()`; it should never call `.fit()`.
