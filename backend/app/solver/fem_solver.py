"""
Linear static FEM solver using the Direct Stiffness Method.
Supports 3D frames with 6 DOFs per node: [ux, uy, uz, rx, ry, rz].
Pure Python implementation using NumPy and SciPy -- no native dependencies.
"""
from __future__ import annotations

import math
from typing import Dict, List

import numpy as np
from scipy.sparse import lil_matrix
from scipy.sparse.linalg import spsolve

from app.solver.element_stiffness import (
    beam_element_stiffness_local_3d,
    rotation_matrix_3d,
)

DOFS_PER_NODE = 6


def solve_linear_static(
    nodes: List[dict],
    members: List[dict],
    restraints: Dict,
    loads: List[dict],
) -> dict:
    """
    Solve a 3D frame by the Direct Stiffness Method (6 DOFs per node).

    Parameters
    ----------
    nodes    : [{"id": int, "x": float, "y": float, "z": float}, ...]
    members  : [{"id": int, "i": int, "j": int, "E": float, "A": float,
                  "Iz": float, "Iy": float, "G": float, "J": float}, ...]
    restraints : {node_id: [Ux, Uy, Uz, Rx, Ry, Rz]}  where 1=fixed, 0=free
    loads    : [{"node": int, "Fx": float, "Fy": float, "Fz": float,
                  "Mx": float, "My": float, "Mz": float}, ...]

    Returns
    -------
    dict with keys: displacements, member_forces, reactions
    """
    # ── 1. Build DOF map: node_id -> [dof0..dof5] ────────────────────────────
    node_map = {n["id"]: n for n in nodes}
    sorted_node_ids = sorted(node_map.keys())
    dof_map: Dict[int, List[int]] = {}
    ndof = 0
    for nid in sorted_node_ids:
        dof_map[nid] = list(range(ndof, ndof + DOFS_PER_NODE))
        ndof += DOFS_PER_NODE

    # ── 2. Assemble global stiffness matrix (sparse) ─────────────────────────
    K = lil_matrix((ndof, ndof))

    # Pre-compute element info for later member-force extraction
    elem_info = []  # (member, L, T, dofs_i, dofs_j)

    for mem in members:
        ni = node_map[mem["i"]]
        nj = node_map[mem["j"]]

        xi, yi, zi = ni["x"], ni["y"], ni.get("z", 0.0)
        xj, yj, zj = nj["x"], nj["y"], nj.get("z", 0.0)

        dx = xj - xi
        dy = yj - yi
        dz = zj - zi
        L = math.sqrt(dx * dx + dy * dy + dz * dz)
        if L == 0:
            raise ValueError(
                f"Member {mem['id']} has zero length (nodes {mem['i']} and {mem['j']} coincide)"
            )

        E = mem["E"]
        A = mem["A"]
        Iz = mem["Iz"]
        Iy = mem["Iy"]
        G = mem["G"]
        J = mem["J"]

        # Local and global stiffness
        k_local = beam_element_stiffness_local_3d(E, A, Iy, Iz, G, J, L)
        T = rotation_matrix_3d(xi, yi, zi, xj, yj, zj)
        k_global = T.T @ k_local @ T

        dofs_i = dof_map[mem["i"]]
        dofs_j = dof_map[mem["j"]]
        elem_dofs = dofs_i + dofs_j  # list of 12 DOF indices

        # Scatter into global K
        for a in range(12):
            for b in range(12):
                K[elem_dofs[a], elem_dofs[b]] += k_global[a, b]

        elem_info.append((mem, L, T, k_local, dofs_i, dofs_j))

    # ── 3. Build force vector ────────────────────────────────────────────────
    F = np.zeros(ndof)
    for load in loads:
        nid = load["node"]
        dofs = dof_map[nid]
        F[dofs[0]] += load.get("Fx", 0.0)
        F[dofs[1]] += load.get("Fy", 0.0)
        F[dofs[2]] += load.get("Fz", 0.0)
        F[dofs[3]] += load.get("Mx", 0.0)
        F[dofs[4]] += load.get("My", 0.0)
        F[dofs[5]] += load.get("Mz", 0.0)

    # ── 4. Partition DOFs into free and fixed ────────────────────────────────
    free_dofs = []
    fixed_dofs = []
    for nid in sorted_node_ids:
        r = restraints.get(nid, [0, 0, 0, 0, 0, 0])
        # Pad 3-DOF restraints for backward compatibility
        if len(r) == 3:
            r = list(r) + [0, 0, 0]
        for local_idx in range(DOFS_PER_NODE):
            dof = dof_map[nid][local_idx]
            if r[local_idx] == 1:
                fixed_dofs.append(dof)
            else:
                free_dofs.append(dof)

    free_dofs = np.array(free_dofs, dtype=int)
    fixed_dofs = np.array(fixed_dofs, dtype=int)

    # ── 5. Solve: Kff * u_free = Ff ──────────────────────────────────────────
    K_csc = K.tocsc()
    Kff = K_csc[np.ix_(free_dofs, free_dofs)]
    Ff = F[free_dofs]

    u = np.zeros(ndof)
    if len(free_dofs) > 0:
        u_free = spsolve(Kff, Ff)
        u[free_dofs] = u_free

    # ── 6. Compute reactions: R = K @ u - F ──────────────────────────────────
    R = K_csc.dot(u) - F

    # ── 7. Build displacement results ────────────────────────────────────────
    displacements = []
    for nid in sorted_node_ids:
        dofs = dof_map[nid]
        displacements.append({
            "node": nid,
            "ux": float(u[dofs[0]]),
            "uy": float(u[dofs[1]]),
            "uz": float(u[dofs[2]]),
            "rx": float(u[dofs[3]]),
            "ry": float(u[dofs[4]]),
            "rz": float(u[dofs[5]]),
        })

    # ── 8. Build reaction results (supported nodes only) ─────────────────────
    reactions = []
    for nid in sorted_node_ids:
        r = restraints.get(nid, [0, 0, 0, 0, 0, 0])
        if len(r) == 3:
            r = list(r) + [0, 0, 0]
        if any(r):
            dofs = dof_map[nid]
            reactions.append({
                "node": nid,
                "Fx": float(R[dofs[0]]),
                "Fy": float(R[dofs[1]]),
                "Fz": float(R[dofs[2]]),
                "Mx": float(R[dofs[3]]),
                "My": float(R[dofs[4]]),
                "Mz": float(R[dofs[5]]),
            })

    # ── 9. Compute member end forces in local coordinates ────────────────────
    member_forces = []
    for mem, L, T, k_local, dofs_i, dofs_j in elem_info:
        # Element global displacements
        elem_dofs = dofs_i + dofs_j
        u_elem = np.array([u[d] for d in elem_dofs])

        # Transform to local coordinates
        u_local = T @ u_elem

        # Local end forces
        f_local = k_local @ u_local

        # f_local = [ux1, uy1, uz1, rx1, ry1, rz1, ux2, uy2, uz2, rx2, ry2, rz2]
        # Mapping: N=ux, Vy=uy, Vz=uz, T=rx, My=ry, Mz=rz
        member_forces.append({
            "id": mem["id"],
            "N":  [float(f_local[0]),  float(f_local[6])],
            "Vy": [float(f_local[1]),  float(f_local[7])],
            "Vz": [float(f_local[2]),  float(f_local[8])],
            "T":  [float(f_local[3]),  float(f_local[9])],
            "My": [float(f_local[4]),  float(f_local[10])],
            "Mz": [float(f_local[5]),  float(f_local[11])],
        })

    return {
        "displacements": displacements,
        "member_forces": member_forces,
        "reactions": reactions,
    }
