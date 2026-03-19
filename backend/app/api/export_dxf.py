"""
DXF Export and Import API endpoints.
"""
from __future__ import annotations

import io
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import ezdxf

from app.models.structural import StructuralModel
from app.models.results import AnalysisResults
from app.export.dxf_generator import generate_dxf
from app.export.dxf_importer import parse_dxf_to_model

router = APIRouter()


class ExportRequest(BaseModel):
    model: StructuralModel
    results: Optional[AnalysisResults] = None
    version: str = "R2010"


@router.post("/export/dxf")
def export_dxf(request: ExportRequest):
    """Export a structural model (and optional results) as a DXF file."""
    try:
        doc = generate_dxf(request.model, request.results, request.version)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DXF generation failed: {str(e)}")

    stream = io.BytesIO()
    doc.write(stream)
    stream.seek(0)
    return StreamingResponse(
        stream,
        media_type="application/dxf",
        headers={"Content-Disposition": "attachment; filename=structural-model.dxf"},
    )


@router.post("/import/dxf")
async def import_dxf(file: UploadFile = File(...)):
    """Import a DXF file and parse it into a structural model dict."""
    contents = await file.read()
    try:
        doc = ezdxf.read(io.StringIO(contents.decode("utf-8", errors="replace")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse DXF file: {str(e)}")

    try:
        model = parse_dxf_to_model(doc)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to convert DXF to model: {str(e)}")

    return model
