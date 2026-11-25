"""Database connection manager for MongoDB Atlas using PyMongo."""

import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, PyMongoError
from app.config import settings

logger = logging.getLogger(__name__)


class MongoDBManager:
    """Manages the MongoDB Atlas client and database connection lifecycle."""

    def __init__(self) -> None:
        self._client: Optional[MongoClient] = None
        self._db: Optional[Database] = None

    def connect(self) -> None:
        """Connect to MongoDB Atlas using the configured connection URI."""
        if not settings.MONGODB_URI or "<username>" in settings.MONGODB_URI:
            logger.warning(
                "MongoDB Atlas URI is not configured or contains placeholder credentials. "
                "Database operations will be skipped or mocked until configured in backend/.env."
            )
            return

        try:
            self._client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            # Trigger server connection check
            self._client.admin.command("ping")
            self._db = self._client[settings.MONGODB_DB_NAME]
            logger.info("Successfully connected to MongoDB Atlas database: %s", settings.MONGODB_DB_NAME)
        except (ConnectionFailure, PyMongoError) as e:
            logger.error("Failed to connect to MongoDB Atlas: %s", e)
            self._client = None
            self._db = None

    def disconnect(self) -> None:
        """Close the MongoDB connection pool."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("Closed MongoDB Atlas connection.")

    def get_database(self) -> Optional[Database]:
        """Return the active MongoDB database instance, or None if unavailable."""
        return self._db

    def is_connected(self) -> bool:
        """Check whether MongoDB connection is currently established."""
        if self._client is None or self._db is None:
            return False
        try:
            self._client.admin.command("ping")
            return True
        except Exception:
            return False


db_manager = MongoDBManager()


def get_db() -> Optional[Database]:
    """Dependency / accessor for the active MongoDB database."""
    return db_manager.get_database()
