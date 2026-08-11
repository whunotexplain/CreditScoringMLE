import json
import joblib
import numpy as np

from app.core.config import settings

_model = None
_calibrator = None
_threshold = None
_feature_order: list[str] | None = None
_feature_defaults: dict[str, float] | None = None


def load_model():
    global _model, _calibrator, _threshold, _feature_order, _feature_defaults

    _model = joblib.load(settings.MODEL_PATH)
    _calibrator = joblib.load(settings.CALIBRATOR_PATH)

    with open(settings.THRESHOLD_PATH) as f:
        _threshold = json.load(f)["optimal_threshold"]

    with open(settings.FEATURE_DEFAULTS_PATH) as f:
        data = json.load(f)
        _feature_order = data["feature_order"]
        _feature_defaults = data["defaults"]


def is_loaded() -> bool:
    return _model is not None


def calibrator_loaded() -> bool:
    return _calibrator is not None


def get_threshold() -> float:
    return _threshold


def get_feature_order() -> list[str]:
    return _feature_order


def get_booster():
    return _model.get_booster()


def build_feature_vector(raw: dict) -> np.ndarray:
    """12 полей с формы + медианы по остальным ~150 фичам (bureau/prev/POS/
    credit_card агрегаты, one-hot и target-encoded категории) — у новой
    заявки с фронта этой истории нет, поэтому 'нет истории' = медиана."""
    row = dict(_feature_defaults)
    for key, value in raw.items():
        if value is not None and key in row:
            row[key] = value
    return np.array([[row[c] for c in _feature_order]], dtype=np.float32)


def predict_one(raw: dict) -> dict:
    X = build_feature_vector(raw)
    raw_proba = float(_model.predict_proba(X)[:, 1][0])
    calibrated_proba = float(_calibrator.predict([raw_proba])[0])
    return {"raw_proba": raw_proba, "calibrated_proba": calibrated_proba}