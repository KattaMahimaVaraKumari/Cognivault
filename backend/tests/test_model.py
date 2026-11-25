"""Unit tests for the ModelService and champion Logistic Regression pipeline."""

import pytest
from app.services.model_service import ModelService, RISK_ORDER


def test_model_service_load_and_predict():
    """Verify loading the real champion model and performing inference."""
    service = ModelService()
    service.load_model()
    assert service.is_loaded

    test_payload = {
        "study_hours_outside_classes_per_day": 2.5,
        "academic_tasks_per_week": 6,
        "academic_workload": 3,
        "time_pressure": 3,
        "avg_sleep_hours": 7.0,
        "wakes_up_tired": 2,
        "physical_activity_days_per_week": 3,
        "difficulty_concentrating": 2,
        "academic_emotional_exhaustion": 2,
    }

    result = service.predict(test_payload)

    assert result["status"] == "success"
    assert result["model_used"] == "LogisticRegression"
    assert result["burnout_risk_level"] in RISK_ORDER
    assert 0.0 <= result["confidence"] <= 1.0

    probas = result["probabilities"]
    assert len(probas) == 4
    for tier in RISK_ORDER:
        assert tier in probas
        assert 0.0 <= probas[tier] <= 1.0

    assert pytest.approx(sum(probas.values()), abs=0.01) == 1.0


def test_model_service_high_risk_prediction():
    """Verify inference for a high-risk profile returns High or Critical."""
    service = ModelService()
    service.load_model()

    critical_payload = {
        "study_hours_outside_classes_per_day": 6.5,
        "academic_tasks_per_week": 16,
        "academic_workload": 5,
        "time_pressure": 5,
        "avg_sleep_hours": 3.8,
        "wakes_up_tired": 5,
        "physical_activity_days_per_week": 0,
        "difficulty_concentrating": 5,
        "academic_emotional_exhaustion": 5,
    }

    result = service.predict(critical_payload)
    assert result["burnout_risk_level"] in ["High", "Critical"]
    assert result["probabilities"]["Critical"] > 0.40


def test_model_service_missing_feature_raises_error():
    """Verify missing required features triggers an exception."""
    service = ModelService()
    incomplete_payload = {
        "study_hours_outside_classes_per_day": 2.5,
        # missing other 8 features
    }
    with pytest.raises(ValueError) as exc:
        service.predict(incomplete_payload)
    assert "Missing required features" in str(exc.value)
