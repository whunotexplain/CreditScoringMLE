import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, JSON

from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    features = Column(JSON, nullable=False)
    probability = Column(Float, nullable=False)
    decision = Column(String(16), nullable=False)
    threshold = Column(Float, nullable=False)
    feature_names = Column(JSON, nullable=False)
    shap_values = Column(JSON, nullable=False)
    base_value = Column(Float, nullable=False)
    model_version = Column(String(32), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)