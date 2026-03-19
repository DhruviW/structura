from fastapi import APIRouter, HTTPException
from app.models.structural import StructuralModel
from app.models.results import AnalysisResults
from app.solver.validator import validate_model
from app.solver.runner import run_linear_static

router = APIRouter()


@router.post("/analyze/linear-static", response_model=AnalysisResults)
def analyze_linear_static(model: StructuralModel):
    errors = validate_model(model)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    try:
        results = run_linear_static(model)
        return results
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze/modal", status_code=501)
def analyze_modal():
    raise HTTPException(status_code=501, detail="Modal analysis not yet implemented")
