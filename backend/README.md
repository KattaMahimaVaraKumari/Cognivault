# Cognivault AI — FastAPI Backend Service

Production-ready backend inference API for Cognivault AI, powered by FastAPI, MongoDB Atlas, and the project's trained scikit-learn champion Logistic Regression model.

---

## 🚀 Key Features

1. **Pre-trained Champion Model Serving:**
   - Directly loads `models/logistic_regression_model.joblib` (~2.4 KB) once on startup.
   - Preserves internal `StandardScaler` (no external normalization needed).
   - Zero retraining, zero modifications to the serialized model.

2. **Full Compatibility with Frontend & Integration Guide:**
   - Supports direct 9 numeric survey features per [`docs/BACKEND_INTEGRATION_GUIDE.md`](../docs/BACKEND_INTEGRATION_GUIDE.md).
   - Intelligently maps raw questionnaire multiple-choice options submitted by the active React UI to exact numerical features.
   - Produces risk levels (`Low`, `Moderate`, `High`, `Critical`), class probabilities, and confidence scores.

3. **MongoDB Atlas Cloud Persistence:**
   - Stores completed assessments, feature vectors, risk tiers, probabilities, and UTC timestamps using PyMongo.
   - Non-blocking: gracefully operates even if credentials are not yet configured during local testing.

4. **CORS Enabled:**
   - Pre-configured to accept requests from the Vite frontend (`http://localhost:5173` and `http://127.0.0.1:5173`).

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application & lifespan management
│   ├── config.py                   # Settings & .env loading via pydantic-settings
│   ├── database.py                 # PyMongo MongoDB Atlas connection manager
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── prediction.py           # Pydantic models for request, response, and health
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_service.py        # ML inference service
│   │   ├── mapping_service.py      # Questionnaire text-to-numeric mapper
│   │   └── assessment_repository.py# MongoDB Atlas CRUD operations
│   └── routers/
│       ├── __init__.py
│       ├── health.py               # GET /api/health
│       └── prediction.py           # POST /api/predict-burnout & GET /api/assessments/history
├── tests/
│   ├── __init__.py
│   ├── test_api.py                 # Endpoint integration tests (TestClient + mongomock)
│   ├── test_model.py               # Model loading & inference validation
│   └── test_mapping.py             # Questionnaire mapping tests
├── .env.example                    # Template for environment variables
├── requirements.txt                # Python dependencies
└── README.md                       # Documentation & run instructions
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Active MongoDB Atlas Cluster (Free tier or higher)

### 2. Install Dependencies
From the repository root or the `backend/` directory:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `backend/.env` and enter your MongoDB Atlas connection URI:
```ini
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=cognivault_db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PORT=8000
HOST=0.0.0.0
```

---

## 🏃 Running the Backend Server

Start the Uvicorn development server:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Once running:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/api/health`

---

## 🧪 Running Unit & Integration Tests

The test suite uses `pytest` and `mongomock` to test all components without needing an external database connection:

```bash
cd backend
python -m pytest tests -v
```

---

## 🔌 API Endpoints Summary

### 1. Health Check
`GET /api/health`
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": ".../models/logistic_regression_model.joblib",
  "database_connected": true,
  "version": "1.0.0"
}
```

### 2. Predict Burnout Risk
`POST /api/predict-burnout`

#### Option A: Direct Numeric Features (Integration Guide format)
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

#### Option B: Active Frontend Questionnaire Format
```json
{
  "responses": {
    "study_hours_outside_classes": { "selected": ["4–6 hours"] },
    "academic_tasks_weekly": { "selected": ["9–12"] },
    "perceived_academic_workload": { "selected": ["Often"] },
    "nightly_sleep_hours": { "selected": ["5–6 hours"] },
    "frequency_waking_tired": { "selected": ["Often"] },
    "weekly_physical_activity": { "selected": ["1–2 days"] },
    "difficulty_concentrating": { "selected": ["Often"] },
    "mental_emotional_exhaustion": { "selected": ["Very often"] }
  },
  "user_id": "student_abc_123"
}
```

#### Response:
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
  },
  "assessment_id": "673f32488a14b537c414d7a1",
  "created_at": "2026-11-21T10:35:00.000000Z"
}
```

### 3. Assessment History
`GET /api/assessments/history?limit=10&user_id=student_abc_123`
Returns recent logged assessments stored in MongoDB Atlas.
