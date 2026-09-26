"""Existing rule-engine endpoints, preserved until the new engine replaces them."""
from fastapi import APIRouter, HTTPException

from rule_engine.evaluator import RuleEngineEvaluator, load_guidelines
from rule_engine.models import EvaluationResponse, RecommendationRequest

router = APIRouter(prefix="/api/v1", tags=["engine"])
evaluator = RuleEngineEvaluator()


@router.get("/guidelines")
def get_guidelines():
    return load_guidelines()


@router.post("/recommend", response_model=EvaluationResponse)
def generate_recommendations(req: RecommendationRequest):
    try:
        return evaluator.evaluate(req.profile, req.history)
    except Exception:
        # Never echo internals or user data back in errors.
        raise HTTPException(status_code=500, detail="The assessment could not be completed.")
