"""
Model validator: cross-reference checks for StructuralModel.
Returns a list of error strings (empty list = model is valid).
"""
from __future__ import annotations

from typing import List

from app.models.structural import StructuralModel, PointLoad, DistributedLoad, MomentLoad


def validate_model(model: StructuralModel) -> List[str]:
    """Run all cross-reference checks and return a list of error strings."""
    errors: List[str] = []

    node_ids = {n.id for n in model.nodes}
    material_ids = {m.id for m in model.materials}
    section_ids = {s.id for s in model.sections}
    member_ids = {m.id for m in model.members}

    # ── Member checks ─────────────────────────────────────────────────────────
    for member in model.members:
        if member.i not in node_ids:
            errors.append(f"Member {member.id} references missing node {member.i}")
        if member.j not in node_ids:
            errors.append(f"Member {member.id} references missing node {member.j}")
        if member.material not in material_ids:
            errors.append(
                f"Member {member.id} references missing material '{member.material}'"
            )
        if member.section and section_ids and member.section not in section_ids:
            errors.append(
                f"Member {member.id} references missing section '{member.section}'"
            )

    # ── Plate checks ──────────────────────────────────────────────────────────
    for plate in model.plates:
        for nid in plate.nodes:
            if nid not in node_ids:
                errors.append(f"Plate {plate.id} references missing node {nid}")
        if plate.material not in material_ids:
            errors.append(
                f"Plate {plate.id} references missing material '{plate.material}'"
            )

    # ── Load checks ───────────────────────────────────────────────────────────
    for load in model.loads:
        if isinstance(load, (PointLoad, MomentLoad)):
            if load.node not in node_ids:
                errors.append(f"Load references missing node {load.node}")
        elif isinstance(load, DistributedLoad):
            if load.member not in member_ids:
                errors.append(f"Load references missing member {load.member}")

    # ── Global checks ─────────────────────────────────────────────────────────
    has_support = any(any(r for r in n.restraints) for n in model.nodes)
    if not has_support:
        errors.append("Model has no supports (all restraints are zero)")

    if not model.loads:
        errors.append("Model has no loads applied")

    return errors
