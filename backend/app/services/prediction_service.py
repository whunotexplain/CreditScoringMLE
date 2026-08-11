from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.ml import model as model_module
from app.ml.explain import compute_shap_values, top_features
from app.redis.client import get_cached_prediction, set_cached_prediction
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.prediction import PredictionResponse


def _decide(calibrated_proba: float, threshold: float) -> str:
    return "reject" if calibrated_proba >= threshold else "approve"


class PredictionService:
    def __init__(self, db: Session):
        self.repo = PredictionRepository(db)

    def score(self, raw_features: dict) -> PredictionResponse:
        if not model_module.is_loaded():
            raise HTTPException(status_code=503, detail="Model not loaded")

        cached = get_cached_prediction(raw_features)
        if cached is not None:
            calibrated_proba = cached["calibrated_proba"]
        else:
            calibrated_proba = model_module.predict_one(raw_features)["calibrated_proba"]
            set_cached_prediction(raw_features, {"calibrated_proba": calibrated_proba})

        X = model_module.build_feature_vector(raw_features)
        shap_values, base_value = compute_shap_values(X)
        feature_names = model_module.get_feature_order()
        top = top_features(shap_values[0], feature_names)
        threshold = model_module.get_threshold()
        decision = _decide(calibrated_proba, threshold)

        record = self.repo.create(
            features=raw_features,
            probability=calibrated_proba,
            decision=decision,
            threshold=threshold,
            feature_names=feature_names,
            shap_values=shap_values[0].tolist(),
            base_value=base_value,
            model_version="1.0.0",
        )

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