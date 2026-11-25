"""Health router providing service status and dependencies check."""

from fastapi import APIRouter
from app.config import settings
from app.database import db_manager
from app.schemas.prediction import HealthResponse
from app.services.model_service import model_service

router = APIRouter(prefix="/api", tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Returns the operational status of the API, ML model, and MongoDB Atlas connectivity.",
)
def check_health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        model_loaded=model_service.is_loaded,
        model_path=str(model_service.model_path),
        database_connected=db_manager.is_connected(),
        version="1.0.0",
    )
