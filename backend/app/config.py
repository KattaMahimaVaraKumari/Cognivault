"""Application configuration and environment variables."""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Check for model in backend/models first (deployment self-contained), fallback to root models/
BACKEND_MODEL_PATH = BACKEND_DIR / "models" / "logistic_regression_model.joblib"
ROOT_MODEL_PATH = PROJECT_ROOT / "models" / "logistic_regression_model.joblib"
DEFAULT_MODEL_PATH = BACKEND_MODEL_PATH if BACKEND_MODEL_PATH.exists() else ROOT_MODEL_PATH


class Settings(BaseSettings):
    """Cognivault backend settings loaded from environment or .env file."""

    # Server Configuration
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Model Configuration
    MODEL_PATH: str = str(DEFAULT_MODEL_PATH)

    # MongoDB Atlas Configuration
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "cognivault_db"

    # CORS Settings
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to a list."""
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
