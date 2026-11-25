"""FastAPI main application entrypoint for Cognivault AI."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import db_manager
from app.routers import health, prediction
from app.services.model_service import model_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("cognivault.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: initialize model and MongoDB on startup."""
    logger.info("Starting Cognivault FastAPI backend...")

    # 1. Load ML Model into memory
    try:
        model_service.load_model()
        logger.info("Logistic Regression champion model successfully initialized.")
    except Exception as exc:
        logger.error("Failed to initialize ML model on startup: %s", exc)

    # 2. Initialize MongoDB Atlas client
    try:
        db_manager.connect()
    except Exception as exc:
        logger.warning("MongoDB Atlas initialization warning: %s", exc)

    yield

    # Teardown
    logger.info("Shutting down Cognivault FastAPI backend...")
    db_manager.disconnect()


app = FastAPI(
    title="Cognivault AI — Student Burnout Risk Inference API",
    description=(
        "Backend inference service for Cognivault AI. Uses a trained Logistic Regression "
        "pipeline to predict student burnout risk levels from academic workload and lifestyle features, "
        "persisting assessments to MongoDB Atlas."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router)
app.include_router(prediction.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Cognivault AI Backend API is operational.",
        "docs": "/docs",
        "health": "/api/health",
    }
