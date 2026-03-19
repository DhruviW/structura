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
    ux: float = 0.0   # Horizontal displacement (m)
    uy: float = 0.0   # Vertical displacement (m)
    uz: float = 0.0   # Out-of-plane displacement (m)
    rx: float = 0.0   # Rotation about x-axis (rad)
    ry: float = 0.0   # Rotation about y-axis (rad)
    rz: float = 0.0   # Rotation about z-axis (rad)


# ─── Member Internal Forces ───────────────────────────────────────────────────

class MemberForces(BaseModel):
    id: int
    N: List[float]   # Axial force [i-end, j-end] (N)
    Vy: List[float]  # Shear force in y [i-end, j-end] (N)
    Vz: List[float]  # Shear force in z [i-end, j-end] (N)
    T: List[float]   # Torsion [i-end, j-end] (N·m)
    My: List[float]  # Bending moment about y [i-end, j-end] (N·m)
    Mz: List[float]  # Bending moment about z [i-end, j-end] (N·m)

    @field_validator('N', 'Vy', 'Vz', 'T', 'My', 'Mz')
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
    Fx: float = 0.0
    Fy: float = 0.0
    Fz: float = 0.0
    Mx: float = 0.0
    My: float = 0.0
    Mz: float = 0.0


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
