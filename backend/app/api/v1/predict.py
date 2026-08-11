import csv
import io
import uuid

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import (
    ApplicationData, PredictionResponse, BatchResponse, BatchPrediction, BatchSummary,
)
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict(application: ApplicationData, db: Session = Depends(get_db)) -> PredictionResponse:
    return PredictionService(db).score(application.model_dump())


@router.post("/predict/batch", response_model=BatchResponse)
async def predict_batch(file: UploadFile = File(...), db: Session = Depends(get_db)) -> BatchResponse:
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    service = PredictionService(db)

    predictions, approved, rejected = [], 0, 0
    for i, row in enumerate(reader, start=1):
        raw = {k: (float(v) if v not in (None, "") else None) for k, v in row.items()}
        result = service.score(raw)
        predictions.append(BatchPrediction(id=i, probability=result.probability, decision=result.decision))
        approved += result.decision == "approve"
        rejected += result.decision != "approve"

    return BatchResponse(
        batch_id=str(uuid.uuid4()),
        predictions=predictions,
        summary=BatchSummary(total=len(predictions), approved=approved, rejected=rejected),
    )