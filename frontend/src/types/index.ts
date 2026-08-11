export interface ApplicationData {
  ext_source_1?: number;
  ext_source_2?: number;
  ext_source_3?: number;
  days_birth: number;
  days_employed: number;
  amt_income_total: number;
  amt_credit: number;
  amt_annuity: number;
  credit_to_income_ratio: number;
  annuity_to_income_ratio: number;
  bureau_active_credits_cnt: number;
  prev_app_approved_cnt: number;
}

export interface PredictionResponse {
  prediction_id: string;
  probability: number;
  decision: 'approve' | 'reject' | 'review';
  threshold: number;
  shap_values: Record<string, number>;
  top_features: Array<{
    feature: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
  calibrated: boolean;
  model_version: string;
}

export interface ExplainResponse {
  prediction_id: string;
  base_value: number;
  shap_values: number[];
  waterfall_data: {
    features: string[];
    values: number[];
    cumulative: number[];
  };
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  calibrator_loaded: boolean;
  db_connected: boolean;
  model_version: string;
  timestamp: string;
}

export interface BatchPrediction {
  id: number;
  probability: number;
  decision: string;
}

export interface BatchResponse {
  batch_id: string;
  predictions: BatchPrediction[];
  summary: {
    total: number;
    approved: number;
    rejected: number;
  };
}

export interface ModelInfo {
  version: string;
  metrics: {
    gini: number;
    ks: number;
    brier_score: number;
    ece: number;
  };
  training_date: string;
  features_count: number;
  cutoff: number;
}