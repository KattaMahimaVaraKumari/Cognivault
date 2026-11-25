"""Assessment repository for MongoDB Atlas persistence using PyMongo."""

import datetime
import logging
from typing import Any, Dict, List, Optional
from bson import ObjectId
from pymongo.database import Database

logger = logging.getLogger(__name__)

COLLECTION_NAME = "assessments"


class AssessmentRepository:
    """Handles CRUD operations for student assessments in MongoDB Atlas."""

    def __init__(self, db: Optional[Database] = None) -> None:
        self.db = db

    def save_assessment(
        self,
        features: Dict[str, Any],
        burnout_risk_level: str,
        confidence: float,
        probabilities: Dict[str, float],
        user_id: Optional[str] = None,
        raw_responses: Optional[Dict[str, Any]] = None,
    ) -> Optional[str]:
        """
        Persist an assessment record to MongoDB Atlas.

        Returns
        -------
        Optional[str]
            Inserted document ID (as hex string), or None if database is unavailable.
        """
        if self.db is None:
            logger.warning("MongoDB is not connected. Assessment was not persisted.")
            return None

        try:
            document = {
                "user_id": user_id,
                "burnout_risk_level": burnout_risk_level,
                "confidence": confidence,
                "probabilities": probabilities,
                "features": features,
                "raw_responses": raw_responses,
                "created_at": datetime.datetime.now(datetime.timezone.utc),
            }
            result = self.db[COLLECTION_NAME].insert_one(document)
            inserted_id = str(result.inserted_id)
            logger.info("Assessment saved successfully to MongoDB Atlas with ID: %s", inserted_id)
            return inserted_id
        except Exception as e:
            logger.error("Failed to save assessment to MongoDB: %s", e)
            return None

    def get_assessment(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a single assessment by its ObjectId string."""
        if self.db is None:
            return None

        try:
            doc = self.db[COLLECTION_NAME].find_one({"_id": ObjectId(assessment_id)})
            if doc:
                doc["id"] = str(doc.pop("_id"))
                if "created_at" in doc and isinstance(doc["created_at"], datetime.datetime):
                    doc["created_at"] = doc["created_at"].isoformat()
            return doc
        except Exception as e:
            logger.error("Error retrieving assessment %s: %s", assessment_id, e)
            return None

    def get_recent_assessments(
        self,
        user_id: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Retrieve recent assessment history sorted newest first."""
        if self.db is None:
            return []

        try:
            query = {"user_id": user_id} if user_id else {}
            cursor = self.db[COLLECTION_NAME].find(query).sort("created_at", -1).limit(limit)
            results = []
            for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                if "created_at" in doc and isinstance(doc["created_at"], datetime.datetime):
                    doc["created_at"] = doc["created_at"].isoformat()
                results.append(doc)
            return results
        except Exception as e:
            logger.error("Error retrieving recent assessments: %s", e)
            return []
