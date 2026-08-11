from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.models import Prediction
from app.database.session import get_db
from app.schemas import ExplainResponse, WaterfallData

router = APIRouter()


@router.get("/explain/{prediction_id}", response_model=ExplainResponse)
def explain(prediction_id: str, db: Session = Depends(get_db)) -> ExplainResponse:
    record = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail=f"No prediction found for id={prediction_id}")

    pairs = sorted(zip(record.feature_names, record.shap_values), key=lambda p: abs(p[1]), reverse=True)[:10]
    features = [p[0] for p in pairs]
    values = [p[1] for p in pairs]

    cumulative, running = [], record.base_value
    for v in values:
        running += v
        cumulative.append(running)

    return ExplainResponse(
        prediction_id=record.id,
        base_value=record.base_value,
        shap_values=values,
        waterfall_data=WaterfallData(features=features, values=values, cumulative=cumulative),
    )