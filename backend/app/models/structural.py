"""
Pydantic structural model definitions.
These mirror the TypeScript interfaces in frontend/src/types/model.ts.
"""
from __future__ import annotations

from typing import Annotated, List, Literal, Union

from pydantic import BaseModel, Field, field_validator, model_validator


# ─── Node ─────────────────────────────────────────────────────────────────────

class Node(BaseModel):
    id: int
    x: float
    y: float
    z: float = 0.0
    restraints: List[int]

    @field_validator('restraints')
    @classmethod
    def validate_restraints(cls, v: List[int]) -> List[int]:
        if len(v) == 3:
            # Backwards-compatible: pad 3-DOF restraints to 6-DOF with zeros
            v = v + [0, 0, 0]
        if len(v) != 6:
            raise ValueError('restraints must have exactly 6 components [Ux, Uy, Uz, Rx, Ry, Rz]')
        for val in v:
            if val not in (0, 1):
                raise ValueError(f'Each restraint value must be 0 or 1, got {val}')
        return v


# ─── Member ───────────────────────────────────────────────────────────────────

class Member(BaseModel):
    id: int
    i: int
    j: int
    section: str
    material: str

    @model_validator(mode='after')
    def validate_distinct_nodes(self) -> 'Member':
        if self.i == self.j:
            raise ValueError('Member start node i and end node j must be different')
        return self


# ─── Plate ────────────────────────────────────────────────────────────────────

class Plate(BaseModel):
    id: int
    nodes: List[int]
    thickness: float
    material: str
    type: Literal['shell', 'membrane']

    @field_validator('nodes')
    @classmethod
    def validate_nodes(cls, v: List[int]) -> List[int]:
        if len(v) != 4:
            raise ValueError('Plate must have exactly 4 corner nodes')
        return v


# ─── Material ─────────────────────────────────────────────────────────────────

class Material(BaseModel):
    id: str
    name: str
    E: float    # Young's modulus (Pa)
    G: float    # Shear modulus (Pa)
    nu: float   # Poisson's ratio
    rho: float  # Density (kg/m³)
    fy: float   # Yield strength (Pa)

    @field_validator('E', 'G', 'fy')
    @classmethod
    def validate_positive(cls, v: float, info) -> float:
        if v <= 0:
            raise ValueError(f'{info.field_name} must be positive, got {v}')
        return v


# ─── Section ──────────────────────────────────────────────────────────────────

class Section(BaseModel):
    id: str
    name: str
    A: float    # Cross-sectional area (m²)
    Iz: float   # Second moment of area about z (m⁴)
    Iy: float   # Second moment of area about y (m⁴)
    J: float    # Torsional constant (m⁴)
    Ix: float = 0.0  # Moment of inertia about x (torsional rigidity, m⁴)
    Sz: float   # Section modulus about z (m³)
    Sy: float   # Section modulus about y (m³)


# ─── Loads ────────────────────────────────────────────────────────────────────

class PointLoad(BaseModel):
    id: int = 0
    type: Literal['point']
    node: int
    Fx: float
    Fy: float
    Fz: float = 0.0
    Mx: float = 0.0
    My: float = 0.0
    Mz: float


class DistributedLoad(BaseModel):
    id: int = 0
    type: Literal['distributed']
    member: int
    wx: float
    wy: float
    wz: float = 0.0


class MomentLoad(BaseModel):
    id: int = 0
    type: Literal['moment']
    node: int
    Mx: float = 0.0
    My: float = 0.0
    Mz: float


# Discriminated union — Pydantic v2 resolves via the 'type' Literal field
Load = Annotated[
    Union[PointLoad, DistributedLoad, MomentLoad],
    Field(discriminator='type'),
]


# ─── Structural Model ─────────────────────────────────────────────────────────

class StructuralModel(BaseModel):
    nodes: List[Node]
    members: List[Member]
    plates: List[Plate]
    materials: List[Material]
    sections: List[Section]
    loads: List[Load]
