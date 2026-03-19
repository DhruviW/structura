// ─── Per-Node Displacement ────────────────────────────────────────────────────

export interface NodeDisplacement {
  node: number
  ux: number  // Horizontal displacement
  uy: number  // Vertical displacement
  rz: number  // Rotation about z-axis
}

// ─── Member Internal Forces ───────────────────────────────────────────────────
// Each component is a tuple [i-end value, j-end value]

export interface MemberForces {
  id: number
  N: [number, number]  // Axial force at [i-end, j-end]
  V: [number, number]  // Shear force at [i-end, j-end]
  M: [number, number]  // Bending moment at [i-end, j-end]
}

// ─── Support Reactions ────────────────────────────────────────────────────────

export interface Reaction {
  node: number
  Fx: number
  Fy: number
  Mz: number
}

// ─── Plate Stresses ───────────────────────────────────────────────────────────

export interface PlateStress {
  id: number
  sxx: number       // Normal stress in x
  syy: number       // Normal stress in y
  sxy: number       // Shear stress
  von_mises: number // Von Mises equivalent stress
}

// ─── Full Analysis Results ────────────────────────────────────────────────────

export interface AnalysisResults {
  displacements: NodeDisplacement[]
  member_forces: MemberForces[]
  reactions: Reaction[]
  plate_stresses: PlateStress[]
}
