"""FastAPI routers for burnout risk prediction and assessment handling."""

import datetime
from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import ValidationError
from app.database import get_db
from app.schemas.prediction import (
    AssessmentHistoryItem,
    PredictionProbabilities,
    PredictionResponse,
    QuestionnaireAssessmentInput,
    StudentSurveyInput,
)
from app.services.assessment_repository import AssessmentRepository
from app.services.mapping_service import map_questionnaire_to_features
from app.services.model_service import model_service

router = APIRouter(prefix="/api", tags=["Burnout Prediction"])


@router.post(
    "/predict-burnout",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict student burnout risk level",
    description=(
        "Accepts either the direct 9 numeric survey features (per BACKEND_INTEGRATION_GUIDE.md) "
        "or raw questionnaire response selections from the frontend, runs inference using the "
        "trained Logistic Regression pipeline, and optionally stores the assessment in MongoDB Atlas."
    ),
)
@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def predict_burnout(
    payload: Dict[str, Any] = Body(...),
    db=Depends(get_db),
) -> PredictionResponse:
    features: Dict[str, float] = {}
    raw_responses: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

    # Case A: Frontend wrapped questionnaire response: {"responses": {...}, "user_id": "..."}
    if "responses" in payload:
        user_id = payload.get("user_id")
        raw_responses = payload["responses"]
        try:
            features = map_questionnaire_to_features(raw_responses)
        except ValueError as err:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(err),
            )
    else:
        # Check if direct 9 numeric survey features were passed
        # We validate using Pydantic StudentSurveyInput
        try:
            survey_input = StudentSurveyInput(**payload)
            features = survey_input.model_dump()
        except ValidationError as val_err:
            # If the payload was meant as questionnaire options directly
            # check if questionnaire keys are present
            known_q_keys = {
                "study_hours_outside_classes",
                "academic_tasks_weekly",
                "perceived_academic_workload",
                "nightly_sleep_hours",
                "frequency_waking_tired",
                "weekly_physical_activity",
                "mental_emotional_exhaustion",
            }
            if any(k in payload for k in known_q_keys):
                try:
                    features = map_questionnaire_to_features(payload)
                except ValueError as err:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=str(err),
                    )
            else:
                # Genuine numeric validation error (e.g. academic_workload > 5)
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=val_err.errors(),
                )

    # 2. Run inference on the model
    try:
        prediction_result = model_service.predict(features)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference engine failure: {exc}",
        )

    # 3. Store in MongoDB Atlas
    repo = AssessmentRepository(db)
    inserted_id = repo.save_assessment(
        features=features,
        burnout_risk_level=prediction_result["burnout_risk_level"],
        confidence=prediction_result["confidence"],
        probabilities=prediction_result["probabilities"],
        user_id=user_id,
        raw_responses=raw_responses,
    )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    return PredictionResponse(
        status="success",
        model_used="LogisticRegression",
        burnout_risk_level=prediction_result["burnout_risk_level"],
        confidence=prediction_result["confidence"],
        probabilities=PredictionProbabilities(**prediction_result["probabilities"]),
        assessment_id=inserted_id,
        created_at=now_iso,
    )


@router.get(
    "/assessments/history",
    response_model=List[AssessmentHistoryItem],
    summary="Get recent assessment history",
)
def get_assessment_history(
    user_id: Optional[str] = None,
    limit: int = 10,
    db=Depends(get_db),
) -> List[AssessmentHistoryItem]:
    repo = AssessmentRepository(db)
    docs = repo.get_recent_assessments(user_id=user_id, limit=limit)
    return [
        AssessmentHistoryItem(
            id=doc["id"],
            burnout_risk_level=doc["burnout_risk_level"],
            confidence=doc["confidence"],
            probabilities=doc["probabilities"],
            features=doc.get("features", {}),
            created_at=doc.get("created_at", ""),
        )
        for doc in docs
    ]
