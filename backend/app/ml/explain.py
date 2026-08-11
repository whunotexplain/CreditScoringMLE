import xgboost as xgb
import numpy as np

from app.ml import model as model_module


def compute_shap_values(X: np.ndarray):
    booster = model_module.get_booster()
    dmatrix = xgb.DMatrix(X)
    output = booster.predict(dmatrix, pred_contribs=True)
    return output[:, :-1], float(output[0, -1])


def top_features(shap_row: np.ndarray, feature_names: list[str], n: int = 5) -> list[dict]:
    idx = np.argsort(-np.abs(shap_row))[:n]
    return [
        {
            "feature": feature_names[i],
            "impact": float(shap_row[i]),
            # ниже риск (shap<0) = "positive" для заявителя, выше риск = "negative"
            "direction": "positive" if shap_row[i] < 0 else "negative",
        }
        for i in idx
    ]