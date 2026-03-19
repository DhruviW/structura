"""
2D and 3D beam-column element stiffness matrices using the Direct Stiffness Method.
Pure Python/NumPy implementation -- no native dependencies.
"""
from __future__ import annotations

import numpy as np


# ─── 2D Element Functions (kept for backward compatibility) ──────────────────


def beam_element_stiffness_local(E: float, A: float, I: float, L: float) -> np.ndarray:
    """
    Build the 6x6 local stiffness matrix for an elastic 2D beam-column element.

    DOF order per node: [ux, uy, rz]  (3 DOFs x 2 nodes = 6 DOFs total)

    Parameters
    ----------
    E : Young's modulus (Pa)
    A : Cross-sectional area (m^2)
    I : Second moment of area (m^4)
    L : Element length (m)
    """
    EA_L = E * A / L
    EI_L3 = E * I / L**3
    EI_L2 = E * I / L**2
    EI_L = E * I / L

    k = np.array([
        [ EA_L,    0.0,          0.0,        -EA_L,    0.0,          0.0       ],
        [ 0.0,     12*EI_L3,     6*EI_L2,     0.0,    -12*EI_L3,    6*EI_L2   ],
        [ 0.0,     6*EI_L2,      4*EI_L,      0.0,    -6*EI_L2,     2*EI_L    ],
        [-EA_L,    0.0,          0.0,          EA_L,    0.0,          0.0       ],
        [ 0.0,    -12*EI_L3,    -6*EI_L2,     0.0,     12*EI_L3,   -6*EI_L2   ],
        [ 0.0,     6*EI_L2,      2*EI_L,      0.0,    -6*EI_L2,     4*EI_L    ],
    ])
    return k


def rotation_matrix_2d(cos_angle: float, sin_angle: float) -> np.ndarray:
    """
    Build the 6x6 coordinate-transformation (rotation) matrix T for a
    2D beam element.

    The 3x3 block for one node is:
        [[c, s, 0],
         [-s, c, 0],
         [0, 0, 1]]
    and T is block-diagonal with two such blocks.
    """
    c, s = cos_angle, sin_angle
    T = np.zeros((6, 6))
    # Node i block
    T[0, 0] = c;  T[0, 1] = s
    T[1, 0] = -s; T[1, 1] = c
    T[2, 2] = 1.0
    # Node j block
    T[3, 3] = c;  T[3, 4] = s
    T[4, 3] = -s; T[4, 4] = c
    T[5, 5] = 1.0
    return T


def beam_element_stiffness_global(
    E: float, A: float, I: float, L: float,
    cos_angle: float, sin_angle: float,
) -> np.ndarray:
    """
    Build the 6x6 global stiffness matrix:  K_global = T^T @ K_local @ T
    """
    k_local = beam_element_stiffness_local(E, A, I, L)
    T = rotation_matrix_2d(cos_angle, sin_angle)
    return T.T @ k_local @ T


# ─── 3D Element Functions ────────────────────────────────────────────────────


def beam_element_stiffness_local_3d(
    E: float, A: float, Iy: float, Iz: float, G: float, J: float, L: float,
) -> np.ndarray:
    """
    Build the 12x12 local stiffness matrix for a 3D beam-column element.

    DOF order per node: [ux, uy, uz, rx, ry, rz]  (6 DOFs x 2 nodes = 12 DOFs)

    Parameters
    ----------
    E  : Young's modulus (Pa)
    A  : Cross-sectional area (m^2)
    Iy : Second moment of area about local y-axis (m^4) -- bending in XZ plane
    Iz : Second moment of area about local z-axis (m^4) -- bending in XY plane
    G  : Shear modulus (Pa)
    J  : Torsional constant (m^4)
    L  : Element length (m)
    """
    EA_L = E * A / L
    GJ_L = G * J / L

    # Bending about z-axis (in XY plane)
    EIz_L3 = E * Iz / L**3
    EIz_L2 = E * Iz / L**2
    EIz_L = E * Iz / L

    # Bending about y-axis (in XZ plane)
    EIy_L3 = E * Iy / L**3
    EIy_L2 = E * Iy / L**2
    EIy_L = E * Iy / L

    k = np.zeros((12, 12))

    # Axial: DOFs 0, 6
    k[0, 0] = EA_L;   k[0, 6] = -EA_L
    k[6, 0] = -EA_L;  k[6, 6] = EA_L

    # Bending about Z-axis (uy, rz): DOFs 1, 5, 7, 11
    k[1, 1] = 12 * EIz_L3;    k[1, 5] = 6 * EIz_L2
    k[1, 7] = -12 * EIz_L3;   k[1, 11] = 6 * EIz_L2

    k[5, 1] = 6 * EIz_L2;     k[5, 5] = 4 * EIz_L
    k[5, 7] = -6 * EIz_L2;    k[5, 11] = 2 * EIz_L

    k[7, 1] = -12 * EIz_L3;   k[7, 5] = -6 * EIz_L2
    k[7, 7] = 12 * EIz_L3;    k[7, 11] = -6 * EIz_L2

    k[11, 1] = 6 * EIz_L2;    k[11, 5] = 2 * EIz_L
    k[11, 7] = -6 * EIz_L2;   k[11, 11] = 4 * EIz_L

    # Bending about Y-axis (uz, ry): DOFs 2, 4, 8, 10
    # Note: sign convention differs from Z-bending
    k[2, 2] = 12 * EIy_L3;    k[2, 4] = -6 * EIy_L2
    k[2, 8] = -12 * EIy_L3;   k[2, 10] = -6 * EIy_L2

    k[4, 2] = -6 * EIy_L2;    k[4, 4] = 4 * EIy_L
    k[4, 8] = 6 * EIy_L2;     k[4, 10] = 2 * EIy_L

    k[8, 2] = -12 * EIy_L3;   k[8, 4] = 6 * EIy_L2
    k[8, 8] = 12 * EIy_L3;    k[8, 10] = 6 * EIy_L2

    k[10, 2] = -6 * EIy_L2;   k[10, 4] = 2 * EIy_L
    k[10, 8] = 6 * EIy_L2;    k[10, 10] = 4 * EIy_L

    # Torsion: DOFs 3, 9
    k[3, 3] = GJ_L;   k[3, 9] = -GJ_L
    k[9, 3] = -GJ_L;  k[9, 9] = GJ_L

    return k


def rotation_matrix_3d(
    xi: float, yi: float, zi: float,
    xj: float, yj: float, zj: float,
) -> np.ndarray:
    """
    Build the 12x12 coordinate-transformation matrix T for a 3D beam element.

    The local x-axis runs along the member from node i to node j.
    For non-vertical members, local z = cross(local_x, global_Y), local y = cross(local_z, local_x).
    For vertical members (parallel to global Y), local y = global X, local z = cross(local_x, local_y).

    Parameters
    ----------
    xi, yi, zi : coordinates of node i
    xj, yj, zj : coordinates of node j

    Returns
    -------
    T : 12x12 transformation matrix (block-diagonal with four 3x3 rotation matrices)
    """
    dx = xj - xi
    dy = yj - yi
    dz = zj - zi
    L = np.sqrt(dx * dx + dy * dy + dz * dz)

    # Local x-axis: along the member
    lx = np.array([dx / L, dy / L, dz / L])

    # Reference vector for defining the local y-z plane
    # Check if member is (nearly) vertical (parallel to global Y)
    global_Y = np.array([0.0, 1.0, 0.0])

    if abs(abs(lx[1]) - 1.0) < 1e-8:
        # Vertical member: local y = global X direction
        local_y = np.array([1.0, 0.0, 0.0])
        # Adjust sign so that the system is right-handed
        local_z = np.cross(lx, local_y)
        local_z = local_z / np.linalg.norm(local_z)
        # Recompute local_y to ensure orthogonality
        local_y = np.cross(local_z, lx)
        local_y = local_y / np.linalg.norm(local_y)
    else:
        # Non-vertical member
        local_z = np.cross(lx, global_Y)
        local_z = local_z / np.linalg.norm(local_z)
        local_y = np.cross(local_z, lx)
        local_y = local_y / np.linalg.norm(local_y)

    # 3x3 rotation matrix: rows are local axes in global coordinates
    R = np.array([lx, local_y, local_z])

    # 12x12 block-diagonal transformation matrix
    T = np.zeros((12, 12))
    T[0:3, 0:3] = R
    T[3:6, 3:6] = R
    T[6:9, 6:9] = R
    T[9:12, 9:12] = R

    return T


def beam_element_stiffness_global_3d(
    E: float, A: float, Iy: float, Iz: float, G: float, J: float, L: float,
    xi: float, yi: float, zi: float,
    xj: float, yj: float, zj: float,
) -> np.ndarray:
    """
    Build the 12x12 global stiffness matrix for a 3D beam element:
    K_global = T^T @ K_local @ T
    """
    k_local = beam_element_stiffness_local_3d(E, A, Iy, Iz, G, J, L)
    T = rotation_matrix_3d(xi, yi, zi, xj, yj, zj)
    return T.T @ k_local @ T
