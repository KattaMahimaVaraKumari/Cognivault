"""Unit tests for the questionnaire mapping service."""

import pytest
from app.services.mapping_service import map_questionnaire_to_features


def test_map_full_questionnaire_ui_options():
    """Verify mapping standard frontend questionnaire string choices to correct numeric features."""
    sample_ui_responses = {
        "study_hours_outside_classes": {"selected": ["2–4 hours"]},
        "academic_tasks_weekly": {"selected": ["6–8"]},
        "perceived_academic_workload": {"selected": ["Sometimes"]},
        "nightly_sleep_hours": {"selected": ["6–7 hours"]},
        "frequency_waking_tired": {"selected": ["Rarely"]},
        "weekly_physical_activity": {"selected": ["3–4 days"]},
        "difficulty_concentrating": {"selected": ["Sometimes"]},
        "mental_emotional_exhaustion": {"selected": ["Often"]},
        # Non-model questionnaire questions should be ignored cleanly
        "biggest_difficulty_workload": {"selected": ["Managing deadlines"]},
        "stress_factors_wellbeing": {"selected": ["Academic workload", "Lack of sleep"]},
        "useful_cognivault_features": {"selected": ["Burnout-risk prediction"]},
        "high_risk_suggestions": {"selected": ["Improve sleep"]},
        "open_feedback_design": {"textValue": "Great prototype!"},
    }

    features = map_questionnaire_to_features(sample_ui_responses)

    assert len(features) == 9
    assert features["study_hours_outside_classes_per_day"] == 3.0
    assert features["academic_tasks_per_week"] == 7.0
    assert features["academic_workload"] == 3
    assert features["time_pressure"] == 3  # Defaults to academic_workload when omitted
    assert features["avg_sleep_hours"] == 6.5
    assert features["wakes_up_tired"] == 2
    assert features["physical_activity_days_per_week"] == 3.5
    assert features["difficulty_concentrating"] == 3
    assert features["academic_emotional_exhaustion"] == 4


def test_map_high_risk_questionnaire_responses():
    """Verify mapping extreme/high strain questionnaire answers."""
    high_strain_responses = {
        "study_hours_outside_classes": "More than 6 hours",
        "academic_tasks_weekly": "More than 12",
        "perceived_academic_workload": "Very often",
        "time_pressure": "Very often",
        "nightly_sleep_hours": "Less than 5 hours",
        "frequency_waking_tired": "Very often",
        "weekly_physical_activity": "0 days",
        "difficulty_concentrating": "Very often",
        "mental_emotional_exhaustion": "Very often",
    }

    features = map_questionnaire_to_features(high_strain_responses)

    assert features["study_hours_outside_classes_per_day"] == 6.5
    assert features["academic_tasks_per_week"] == 14.0
    assert features["academic_workload"] == 5
    assert features["time_pressure"] == 5
    assert features["avg_sleep_hours"] == 4.5
    assert features["wakes_up_tired"] == 5
    assert features["physical_activity_days_per_week"] == 0.0
    assert features["difficulty_concentrating"] == 5
    assert features["academic_emotional_exhaustion"] == 5


def test_map_invalid_option_raises_error():
    """Verify invalid options raise descriptive ValueError."""
    bad_responses = {
        "study_hours_outside_classes": {"selected": ["Unknown String"]},
    }
    with pytest.raises(ValueError) as excinfo:
        map_questionnaire_to_features(bad_responses)
    assert "Invalid answer for study hours" in str(excinfo.value)
