"""
2D beam-column element stiffness matrices using the Direct Stiffness Method.
Pure Python/NumPy implementation -- no native dependencies.
"""
from __future__ import annotations

import numpy as np


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
