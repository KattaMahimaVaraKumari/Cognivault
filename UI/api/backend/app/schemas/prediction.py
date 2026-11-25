"""Pydantic schemas for Cognivault burnout prediction and assessment models."""

from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field


class StudentSurveyInput(BaseModel):
    """
    Direct numeric survey features schema matching docs/BACKEND_INTEGRATION_GUIDE.md.
    Strictly accepts the 9 numerical features in their validated numeric ranges.
    """
    study_hours_outside_classes_per_day: float = Field(
        ...,
        ge=0.0,
        le=12.0,
        description="Daily study hours outside class (0.0 to 12.0 hrs)",
        examples=[4.5],
    )
    academic_tasks_per_week: float = Field(
        ...,
        ge=0.0,
        le=25.0,
        description="Weekly assignments or tasks (0 to 25 tasks)",
        examples=[7.0],
    )
    academic_workload: int = Field(
        ...,
        ge=1,
        le=5,
        description="Self-rated academic workload rating (1 to 5)",
        examples=[3],
    )
    time_pressure: int = Field(
        ...,
        ge=1,
        le=5,
        description="Perceived urgency / deadline pressure (1 to 5)",
        examples=[4],
    )
    avg_sleep_hours: float = Field(
        ...,
        ge=3.0,
        le=10.0,
        description="Daily hours of sleep (3.0 to 10.0 hrs)",
        examples=[6.5],
    )
    wakes_up_tired: int = Field(
        ...,
        ge=1,
        le=5,
        description="Morning fatigue score (1 to 5)",
        examples=[3],
    )
    physical_activity_days_per_week: float = Field(
        ...,
        ge=0.0,
        le=7.0,
        description="Active days per week >= 30 mins (0 to 7 days)",
        examples=[2.0],
    )
    difficulty_concentrating: int = Field(
        ...,
        ge=1,
        le=5,
        description="Concentration difficulty rating (1 to 5)",
        examples=[3],
    )
    academic_emotional_exhaustion: int = Field(
        ...,
        ge=1,
        le=5,
        description="Mental / emotional exhaustion score (1 to 5)",
        examples=[4],
    )


class QuestionnaireAnswerState(BaseModel):
    """Represents a question's response state from the frontend."""
    selected: List[str] = Field(default_factory=list)
    otherText: Optional[str] = ""
    textValue: Optional[str] = ""


class QuestionnaireAssessmentInput(BaseModel):
    """
    Frontend questionnaire response payload.
    Supports either a dictionary of AnswerState objects or key-value option strings.
    """
    responses: Dict[str, Union[QuestionnaireAnswerState, str, List[str]]] = Field(
        ...,
        description="Dictionary of questionnaire responses keyed by question ID",
    )
    user_id: Optional[str] = Field(None, description="Optional user ID for tracking history")


class PredictionProbabilities(BaseModel):
    """Probabilities across all 4 burnout risk categories."""
    Low: float = Field(..., ge=0.0, le=1.0)
    Moderate: float = Field(..., ge=0.0, le=1.0)
    High: float = Field(..., ge=0.0, le=1.0)
    Critical: float = Field(..., ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    """
    Clean JSON response format compliant with docs/BACKEND_INTEGRATION_GUIDE.md.
    """
    status: str = Field("success", description="Status string")
    model_used: str = Field("LogisticRegression", description="Classifier identifier")
    burnout_risk_level: str = Field(..., description="Predicted tier: Low, Moderate, High, or Critical")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Winning class probability")
    probabilities: PredictionProbabilities
    assessment_id: Optional[str] = Field(None, description="Persisted MongoDB assessment document ID")
    created_at: Optional[str] = Field(None, description="Assessment creation timestamp (ISO 8601)")


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    model_loaded: bool
    model_path: str
    database_connected: bool
    version: str = "1.0.0"


class AssessmentHistoryItem(BaseModel):
    """Assessment item returned in history list."""
    id: str
    burnout_risk_level: str
    confidence: float
    probabilities: Dict[str, float]
    features: Dict[str, float]
    created_at: str
