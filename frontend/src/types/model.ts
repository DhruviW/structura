// ─── Primitive Types ──────────────────────────────────────────────────────────

export type DOF = 0 | 1
export type Restraints = [DOF, DOF, DOF]
export type SupportType = 'pin' | 'roller' | 'fixed' | 'none'
export type PlateType = 'shell' | 'membrane'
export type LoadType = 'point' | 'distributed' | 'moment'

// ─── Structural Entities ──────────────────────────────────────────────────────

export interface StructuralNode {
  id: number
  x: number
  y: number
  restraints: Restraints
}

export interface Member {
  id: number
  i: number
  j: number
  section: string
  material: string
}

export interface Plate {
  id: number
  nodes: [number, number, number, number]
  thickness: number
  material: string
  type: PlateType
}

export interface Material {
  id: string
  name: string
  E: number   // Young's modulus (Pa)
  G: number   // Shear modulus (Pa)
  nu: number  // Poisson's ratio
  rho: number // Density (kg/m³)
  fy: number  // Yield strength (Pa)
}

export interface Section {
  id: string
  name: string
  A: number   // Cross-sectional area
  Iz: number  // Moment of inertia about z
  Iy: number  // Moment of inertia about y
  J: number   // Torsional constant
  Sz: number  // Section modulus about z
  Sy: number  // Section modulus about y
}

// ─── Loads ────────────────────────────────────────────────────────────────────

export interface PointLoad {
  type: 'point'
  node: number
  Fx: number
  Fy: number
  Mz: number
}

export interface DistributedLoad {
  type: 'distributed'
  member: number
  wx: number
  wy: number
}

export interface MomentLoad {
  type: 'moment'
  node: number
  Mz: number
}

export type Load = PointLoad | DistributedLoad | MomentLoad

// ─── Structural Model ─────────────────────────────────────────────────────────

export interface StructuralModel {
  nodes: StructuralNode[]
  members: Member[]
  plates: Plate[]
  materials: Material[]
  sections: Section[]
  loads: Load[]
}

// ─── Type Guards ──────────────────────────────────────────────────────────────

export function isValidNode(obj: unknown): obj is StructuralNode {
  if (typeof obj !== 'object' || obj === null) return false
  const o = obj as Record<string, unknown>
  if (typeof o.id !== 'number') return false
  if (typeof o.x !== 'number') return false
  if (typeof o.y !== 'number') return false
  if (!Array.isArray(o.restraints)) return false
  if (o.restraints.length !== 3) return false
  if (!o.restraints.every((v: unknown) => v === 0 || v === 1)) return false
  return true
}

export function isValidMember(obj: unknown): obj is Member {
  if (typeof obj !== 'object' || obj === null) return false
  const o = obj as Record<string, unknown>
  if (typeof o.id !== 'number') return false
  if (typeof o.i !== 'number') return false
  if (typeof o.j !== 'number') return false
  if (typeof o.section !== 'string') return false
  if (typeof o.material !== 'string') return false
  return true
}

export function isValidMaterial(obj: unknown): obj is Material {
  if (typeof obj !== 'object' || obj === null) return false
  const o = obj as Record<string, unknown>
  if (typeof o.id !== 'string') return false
  if (typeof o.name !== 'string') return false
  if (typeof o.E !== 'number') return false
  if (typeof o.G !== 'number') return false
  if (typeof o.nu !== 'number') return false
  if (typeof o.rho !== 'number') return false
  if (typeof o.fy !== 'number') return false
  return true
}

export function isValidPlate(obj: unknown): obj is Plate {
  if (typeof obj !== 'object' || obj === null) return false
  const o = obj as Record<string, unknown>
  if (typeof o.id !== 'number') return false
  if (!Array.isArray(o.nodes) || o.nodes.length !== 4) return false
  if (typeof o.thickness !== 'number') return false
  if (typeof o.material !== 'string') return false
  if (o.type !== 'shell' && o.type !== 'membrane') return false
  return true
}
