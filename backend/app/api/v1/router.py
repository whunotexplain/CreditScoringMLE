from fastapi import APIRouter

from app.api.v1 import predict, explain, health, metrics

router = APIRouter()
router.include_router(predict.router, tags=["predict"])
router.include_router(explain.router, tags=["explain"])
router.include_router(health.router, tags=["health"])
router.include_router(metrics.router, tags=["metrics"])