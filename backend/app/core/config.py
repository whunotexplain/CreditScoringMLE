from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]
MODELS_DIR = REPO_ROOT / "ml_service" / "app" / "models"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Credit Scoring API"
    VERSION: str = "1.0.0"

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/credit_scoring"
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 3600

    MODEL_PATH: str = str(MODELS_DIR / "xgboost_model.joblib")
    CALIBRATOR_PATH: str = str(MODELS_DIR / "calibrator.joblib")
    THRESHOLD_PATH: str = str(MODELS_DIR / "threshold.json")
    FEATURE_DEFAULTS_PATH: str = str(MODELS_DIR / "feature_defaults.json")


settings = Settings()