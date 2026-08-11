from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import text

from app.database.session import SessionLocal
from app.ml import model as model_module
from app.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception:
        db_ok = False

    return HealthResponse(
        status="healthy" if (model_module.is_loaded() and db_ok) else "degraded",
        model_loaded=model_module.is_loaded(),
        calibrator_loaded=model_module.calibrator_loaded(),
        db_connected=db_ok,
        model_version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )