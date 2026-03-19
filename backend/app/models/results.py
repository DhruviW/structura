"""
Pydantic results model definitions.
These mirror the TypeScript interfaces in frontend/src/types/results.ts.
"""
from __future__ import annotations

from typing import List, Tuple

from pydantic import BaseModel, field_validator


# ─── Per-Node Displacement ────────────────────────────────────────────────────

class NodeDisplacement(BaseModel):
    node: int
    ux: float   # Horizontal displacement (m)
    uy: float   # Vertical displacement (m)
    rz: float   # Rotation about z-axis (rad)


# ─── Member Internal Forces ───────────────────────────────────────────────────

class MemberForces(BaseModel):
    id: int
    N: List[float]  # Axial force [i-end, j-end] (N)
    V: List[float]  # Shear force [i-end, j-end] (N)
    M: List[float]  # Bending moment [i-end, j-end] (N·m)

    @field_validator('N', 'V', 'M')
    @classmethod
    def validate_two_end_values(cls, v: List[float], info) -> List[float]:
        if len(v) != 2:
            raise ValueError(
                f'{info.field_name} must have exactly 2 values [i-end, j-end], got {len(v)}'
            )
        return v


# ─── Support Reactions ────────────────────────────────────────────────────────

class Reaction(BaseModel):
    node: int
    Fx: float
    Fy: float
    Mz: float


# ─── Plate Stresses ───────────────────────────────────────────────────────────

class PlateStress(BaseModel):
    id: int
    sxx: float        # Normal stress in x (Pa)
    syy: float        # Normal stress in y (Pa)
    sxy: float        # Shear stress (Pa)
    von_mises: float  # Von Mises equivalent stress (Pa)


# ─── Full Analysis Results ────────────────────────────────────────────────────

class AnalysisResults(BaseModel):
    displacements: List[NodeDisplacement]
    member_forces: List[MemberForces]
    reactions: List[Reaction]
    plate_stresses: List[PlateStress]
