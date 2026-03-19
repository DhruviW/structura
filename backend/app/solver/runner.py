"""
Linear static analysis runner.
Prepares inputs from the Pydantic model and delegates to the pure-Python FEM solver.
"""
from __future__ import annotations

from app.models.structural import StructuralModel
from app.models.results import (
    AnalysisResults,
    MemberForces,
    NodeDisplacement,
    Reaction,
)
from app.solver.fem_solver import solve_linear_static


def run_linear_static(model: StructuralModel) -> AnalysisResults:
    """Run a linear static analysis and return structured results."""

    # ── Prepare node list ───────────────────────────────────────────────────
    nodes = [{"id": n.id, "x": n.x, "y": n.y} for n in model.nodes]

    # ── Prepare member list (resolve section & material properties) ─────────
    section_map = {s.id: s for s in model.sections}
    mat_map = {m.id: m for m in model.materials}

    members = []
    for m in model.members:
        sec = section_map.get(m.section)
        mat = mat_map.get(m.material)
        members.append({
            "id": m.id,
            "i": m.i,
            "j": m.j,
            "E": mat.E if mat else 200e9,
            "A": sec.A if sec else 0.01,
            "I": sec.Iz if sec else 1e-4,
        })

    # ── Restraints ──────────────────────────────────────────────────────────
    restraints = {n.id: n.restraints for n in model.nodes}

    # ── Point loads ─────────────────────────────────────────────────────────
    point_loads = []
    for load in model.loads:
        if load.type == "point":
            point_loads.append({
                "node": load.node,
                "Fx": load.Fx,
                "Fy": load.Fy,
                "Mz": load.Mz,
            })

    # ── Solve ───────────────────────────────────────────────────────────────
    result = solve_linear_static(nodes, members, restraints, point_loads)

    # ── Convert to Pydantic AnalysisResults ─────────────────────────────────
    return AnalysisResults(
        displacements=[NodeDisplacement(**d) for d in result["displacements"]],
        member_forces=[MemberForces(**f) for f in result["member_forces"]],
        reactions=[Reaction(**r) for r in result["reactions"]],
        plate_stresses=[],
    )
