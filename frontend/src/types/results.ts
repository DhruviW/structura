// ─── Per-Node Displacement ────────────────────────────────────────────────────

export interface NodeDisplacement {
  node: number
  ux: number  // Horizontal displacement
  uy: number  // Vertical displacement
  uz: number  // Out-of-plane displacement
  rx: number  // Rotation about x-axis
  ry: number  // Rotation about y-axis
  rz: number  // Rotation about z-axis
}

// ─── Member Internal Forces ───────────────────────────────────────────────────
// Each component is a tuple [i-end value, j-end value]

export interface MemberForces {
  id: number
  N: [number, number]   // Axial force at [i-end, j-end]
  Vy: [number, number]  // Shear force in y at [i-end, j-end]
  Vz: [number, number]  // Shear force in z at [i-end, j-end]
  T: [number, number]   // Torsion at [i-end, j-end]
  My: [number, number]  // Bending moment about y at [i-end, j-end]
  Mz: [number, number]  // Bending moment about z at [i-end, j-end]
}

// ─── Support Reactions ────────────────────────────────────────────────────────

export interface Reaction {
  node: number
  Fx: number
  Fy: number
  Fz: number
  Mx: number
  My: number
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
