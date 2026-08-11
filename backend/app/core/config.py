from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]
MODELS_DIR = REPO_ROOT / "ml_service" / "app" / "models"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Credit Scoring API"
    VERSION: str = "1.0.0"

    # SQLite по умолчанию — чтобы потыкать без Postgres/Docker.
    # Для докера потом просто переопредели через .env: DATABASE_URL=postgresql+psycopg2://...
    DATABASE_URL: str = f"sqlite:///{REPO_ROOT / 'backend' / 'credit_scoring.db'}"

    MODEL_PATH: str = str(MODELS_DIR / "xgboost_model.joblib")
    CALIBRATOR_PATH: str = str(MODELS_DIR / "calibrator.joblib")
    THRESHOLD_PATH: str = str(MODELS_DIR / "threshold.json")
    FEATURE_DEFAULTS_PATH: str = str(MODELS_DIR / "feature_defaults.json")


settings = Settings()