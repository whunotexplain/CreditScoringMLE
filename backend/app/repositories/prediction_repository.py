import uuid
from sqlalchemy.orm import Session

from app.database.models import Prediction


class PredictionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Prediction:
        record = Prediction(id=str(uuid.uuid4()), **kwargs)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get(self, prediction_id: str) -> Prediction | None:
        return self.db.query(Prediction).filter(Prediction.id == prediction_id).first()