from typing import Literal
from pydantic import BaseModel, ConfigDict

model_config = ConfigDict(protected_namespaces=())
    
class ApplicationData(BaseModel):
    ext_source_1: float | None = None
    ext_source_2: float | None = None
    ext_source_3: float | None = None
    days_birth: int
    days_employed: int
    amt_income_total: float
    amt_credit: float
    amt_annuity: float
    credit_to_income_ratio: float
    annuity_to_income_ratio: float
    bureau_active_credits_cnt: int
    prev_app_approved_cnt: int


class TopFeature(BaseModel):
    feature: str
    impact: float
    direction: Literal["positive", "negative"]


class PredictionResponse(BaseModel):
    prediction_id: str
    probability: float
    decision: Literal["approve", "reject", "review"]
    threshold: float
    shap_values: dict[str, float]
    top_features: list[TopFeature]
    calibrated: bool
    model_version: str


class WaterfallData(BaseModel):
    features: list[str]
    values: list[float]
    cumulative: list[float]


class ExplainResponse(BaseModel):
    prediction_id: str
    base_value: float
    shap_values: list[float]
    waterfall_data: WaterfallData


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    calibrator_loaded: bool
    db_connected: bool
    model_version: str
    timestamp: str


class BatchPrediction(BaseModel):
    id: int
    probability: float
    decision: str


class BatchSummary(BaseModel):
    total: int
    approved: int
    rejected: int


class BatchResponse(BaseModel):
    batch_id: str
    predictions: list[BatchPrediction]
    summary: BatchSummary