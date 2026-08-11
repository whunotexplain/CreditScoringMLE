import csv
import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.models import Prediction
from app.database.session import get_db
from app.ml import model as model_module
from app.ml.explain import compute_shap_values, top_features
from app.schemas import (
    ApplicationData, PredictionResponse, BatchResponse, BatchPrediction, BatchSummary,
)

router = APIRouter()


def _decide(calibrated_proba: float, threshold: float) -> str:
    # Только 2 уровня — у нас один cost-sensitive порог из 06_business_threshold (0.099),
    # не два (35/65 из README были ориентировочными). "review" зона — TODO на будущее.
    return "reject" if calibrated_proba >= threshold else "approve"


def _score_and_log(raw_features: dict, db: Session) -> PredictionResponse:
    if not model_module.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")

    result = model_module.predict_one(raw_features)
    X = model_module.build_feature_vector(raw_features)
    shap_values, base_value = compute_shap_values(X)
    feature_names = model_module.get_feature_order()
    top = top_features(shap_values[0], feature_names)
    threshold = model_module.get_threshold()
    decision = _decide(result["calibrated_proba"], threshold)

    record = Prediction(
        id=str(uuid.uuid4()),
        features=raw_features,
        probability=result["calibrated_proba"],
        decision=decision,
        threshold=threshold,
        feature_names=feature_names,
        shap_values=shap_values[0].tolist(),
        base_value=base_value,
        model_version="1.0.0",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return PredictionResponse(
        prediction_id=record.id,
        probability=record.probability,
        decision=record.decision,
        threshold=record.threshold,
        shap_values=dict(zip(feature_names, shap_values[0].tolist())),
        top_features=top,
        calibrated=True,
        model_version=record.model_version,
    )


@router.post("/predict", response_model=PredictionResponse)
def predict(application: ApplicationData, db: Session = Depends(get_db)) -> PredictionResponse:
    return _score_and_log(application.model_dump(), db)


@router.post("/predict/batch", response_model=BatchResponse)
async def predict_batch(file: UploadFile = File(...), db: Session = Depends(get_db)) -> BatchResponse:
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))

    predictions, approved, rejected = [], 0, 0
    for i, row in enumerate(reader, start=1):
        raw = {k: (float(v) if v not in (None, "") else None) for k, v in row.items()}
        result = _score_and_log(raw, db)
        predictions.append(BatchPrediction(id=i, probability=result.probability, decision=result.decision))
        approved += result.decision == "approve"
        rejected += result.decision != "approve"

    return BatchResponse(
        batch_id=str(uuid.uuid4()),
        predictions=predictions,
        summary=BatchSummary(total=len(predictions), approved=approved, rejected=rejected),
    )