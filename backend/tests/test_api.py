"""Integration tests for FastAPI endpoints: health, prediction, and mapping."""

import pytest
from fastapi.testclient import TestClient
from mongomock import MongoClient as MockMongoClient
from app.main import app
from app.database import get_db

RISK_ORDER = ["Low", "Moderate", "High", "Critical"]

# Create an in-memory mock MongoDB database for testing
mock_mongo_client = MockMongoClient()
mock_db = mock_mongo_client["test_cognivault_db"]


def override_get_db():
    return mock_db


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client):
    """Verify root GET endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Cognivault" in data["message"]
    assert data["health"] == "/api/health"


def test_health_endpoint(client):
    """Verify /api/health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "logistic_regression_model.joblib" in data["model_path"]


def test_predict_burnout_direct_features(client):
    """Verify POST /api/predict-burnout using direct 9 numeric features."""
    payload = {
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
    response = client.post("/api/predict-burnout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["model_used"] == "LogisticRegression"
    assert data["burnout_risk_level"] in RISK_ORDER
    assert 0.0 <= data["confidence"] <= 1.0
    assert len(data["probabilities"]) == 4
    assert data["assessment_id"] is not None  # Persisted to mock DB


def test_predict_burnout_from_frontend_questionnaire(client):
    """Verify POST /api/predict-burnout with raw questionnaire options."""
    payload = {
        "responses": {
            "study_hours_outside_classes": {"selected": ["2–4 hours"]},
            "academic_tasks_weekly": {"selected": ["6–8"]},
            "perceived_academic_workload": {"selected": ["Sometimes"]},
            "nightly_sleep_hours": {"selected": ["6–7 hours"]},
            "frequency_waking_tired": {"selected": ["Rarely"]},
            "weekly_physical_activity": {"selected": ["3–4 days"]},
            "difficulty_concentrating": {"selected": ["Sometimes"]},
            "mental_emotional_exhaustion": {"selected": ["Often"]},
            "biggest_difficulty_workload": {"selected": ["Managing deadlines"]},
        },
        "user_id": "test_student_123",
    }
    response = client.post("/api/predict-burnout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["burnout_risk_level"] in RISK_ORDER
    assert data["assessment_id"] is not None


def test_predict_burnout_validation_error(client):
    """Verify bad inputs return 422 Unprocessable Entity."""
    # Workload out of range (>5)
    bad_payload = {
        "study_hours_outside_classes_per_day": 5.0,
        "academic_tasks_per_week": 14,
        "academic_workload": 10,
        "time_pressure": 5,
        "avg_sleep_hours": 4.5,
        "wakes_up_tired": 4,
        "physical_activity_days_per_week": 1,
        "difficulty_concentrating": 4,
        "academic_emotional_exhaustion": 5,
    }
    response = client.post("/api/predict-burnout", json=bad_payload)
    assert response.status_code == 422


def test_get_assessment_history(client):
    """Verify GET /api/assessments/history retrieves persisted assessments."""
    payload = {
        "study_hours_outside_classes_per_day": 3.0,
        "academic_tasks_per_week": 5,
        "academic_workload": 2,
        "time_pressure": 2,
        "avg_sleep_hours": 7.5,
        "wakes_up_tired": 1,
        "physical_activity_days_per_week": 4,
        "difficulty_concentrating": 2,
        "academic_emotional_exhaustion": 2,
    }
    post_res = client.post("/api/predict-burnout", json=payload)
    assert post_res.status_code == 200

    history_res = client.get("/api/assessments/history")
    assert history_res.status_code == 200
    items = history_res.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert "burnout_risk_level" in items[0]
