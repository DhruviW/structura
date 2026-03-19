"""
Linear static analysis runner.
Builds an OpenSeesPy model, runs a static analysis, extracts results.
"""
from __future__ import annotations

import openseespy.opensees as ops

from app.models.structural import StructuralModel
from app.models.results import (
    AnalysisResults,
    MemberForces,
    NodeDisplacement,
    Reaction,
)
from app.solver.model_builder import build_opensees_model


def run_linear_static(model: StructuralModel) -> AnalysisResults:
    """Run a linear static analysis and return structured results."""
    # ── Build model ───────────────────────────────────────────────────────────
    build_opensees_model(model)

    # ── Analysis configuration ────────────────────────────────────────────────
    ops.constraints('Plain')
    ops.numberer('RCM')
    ops.system('BandGeneral')
    ops.test('NormDispIncr', 1e-8, 6)
    ops.algorithm('Linear')
    ops.integrator('LoadControl', 1.0)
    ops.analysis('Static')

    # ── Run ───────────────────────────────────────────────────────────────────
    ok = ops.analyze(1)
    if ok != 0:
        ops.wipe()
        raise RuntimeError("OpenSeesPy analysis failed (analyze returned non-zero)")

    # ── Extract displacements (all nodes) ─────────────────────────────────────
    displacements = []
    for node in model.nodes:
        ux = ops.nodeDisp(node.id, 1)
        uy = ops.nodeDisp(node.id, 2)
        rz = ops.nodeDisp(node.id, 3)
        displacements.append(NodeDisplacement(node=node.id, ux=ux, uy=uy, rz=rz))

    # ── Extract reactions (supported nodes only) ──────────────────────────────
    # Call nodeReaction after reactions() to populate reaction cache
    ops.reactions()
    reactions = []
    for node in model.nodes:
        if any(node.restraints):
            Fx = ops.nodeReaction(node.id, 1)
            Fy = ops.nodeReaction(node.id, 2)
            Mz = ops.nodeReaction(node.id, 3)
            reactions.append(Reaction(node=node.id, Fx=Fx, Fy=Fy, Mz=Mz))

    # ── Extract member forces ─────────────────────────────────────────────────
    # eleForce returns [Ni, Vi, Mi, Nj, Vj, Mj] for a 2D beam element
    member_forces = []
    for member in model.members:
        forces = ops.eleForce(member.id)
        # forces: [Ni, Vi, Mi, Nj, Vj, Mj]
        Ni, Vi, Mi = forces[0], forces[1], forces[2]
        Nj, Vj, Mj = forces[3], forces[4], forces[5]
        member_forces.append(
            MemberForces(
                id=member.id,
                N=[Ni, Nj],
                V=[Vi, Vj],
                M=[Mi, Mj],
            )
        )

    ops.wipe()

    return AnalysisResults(
        displacements=displacements,
        member_forces=member_forces,
        reactions=reactions,
        plate_stresses=[],
    )
