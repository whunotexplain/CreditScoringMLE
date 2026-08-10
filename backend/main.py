import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.api.v1.router import router
from app.ml.model import load_model


Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_model()
        logger.info("Модель загружена: %s", settings.MODEL_PATH)
    except FileNotFoundError as e:
        logger.warning("Модель не загружена при старте: %s", e)
    yield 

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ML API для предикта кредитного скоринга",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Credit Scoring API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)