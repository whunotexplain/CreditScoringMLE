from fastapi import APIRouter, Response

router = APIRouter()


@router.get("/metrics")
def metrics() -> Response:
    return Response(content="# credit_scoring_predictions_total placeholder\n", media_type="text/plain")