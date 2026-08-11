
import xgboost as xgb

def compute_shap_values(booster, X):
    """Обходной путь для SHAP из-за бага совместимости shap<->xgboost с base_score."""
    dmatrix = xgb.DMatrix(X)
    output = booster.predict(dmatrix, pred_contribs=True)
    return output[:, :-1], output[0, -1]
