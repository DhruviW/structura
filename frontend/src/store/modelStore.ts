import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  StructuralNode,
  Member,
  Plate,
  Material,
  Section,
  Load,
  StructuralModel,
} from '../types/model'

interface ModelState {
  nodes: StructuralNode[]
  members: Member[]
  plates: Plate[]
  materials: Material[]
  sections: Section[]
  loads: Load[]
}

interface ModelActions {
  // Node CRUD
  addNode: (node: StructuralNode) => void
  updateNode: (id: number, partial: Partial<Omit<StructuralNode, 'id'>>) => void
  removeNode: (id: number) => void

  // Member CRUD
  addMember: (member: Member) => void
  updateMember: (id: number, partial: Partial<Omit<Member, 'id'>>) => void
  removeMember: (id: number) => void

  // Plate CRUD
  addPlate: (plate: Plate) => void
  updatePlate: (id: number, partial: Partial<Omit<Plate, 'id'>>) => void
  removePlate: (id: number) => void

  // Material CRUD
  addMaterial: (material: Material) => void
  updateMaterial: (id: string, partial: Partial<Omit<Material, 'id'>>) => void
  removeMaterial: (id: string) => void

  // Section CRUD
  addSection: (section: Section) => void
  updateSection: (id: string, partial: Partial<Omit<Section, 'id'>>) => void
  removeSection: (id: string) => void

  // Load operations
  addLoad: (load: Load) => void
  removeLoad: (index: number) => void

  // Utility
  nextNodeId: () => number
  nextMemberId: () => number
  toModelJSON: () => StructuralModel
  loadFromJSON: (model: StructuralModel) => void
  reset: () => void
}

const emptyState: ModelState = {
  nodes: [],
  members: [],
  plates: [],
  materials: [],
  sections: [],
  loads: [],
}

export const useModelStore = create<ModelState & ModelActions>()(
  immer((set, get) => ({
    ...emptyState,

    // ─── Node ───────────────────────────────────────────────────────────────────
    addNode: (node) =>
      set((state) => {
        state.nodes.push(node)
      }),

    updateNode: (id, partial) =>
      set((state) => {
        const idx = state.nodes.findIndex((n) => n.id === id)
        if (idx !== -1) Object.assign(state.nodes[idx], partial)
      }),

    removeNode: (id) =>
      set((state) => {
        state.nodes = state.nodes.filter((n) => n.id !== id)
      }),

    // ─── Member ─────────────────────────────────────────────────────────────────
    addMember: (member) =>
      set((state) => {
        state.members.push(member)
      }),

    updateMember: (id, partial) =>
      set((state) => {
        const idx = state.members.findIndex((m) => m.id === id)
        if (idx !== -1) Object.assign(state.members[idx], partial)
      }),

    removeMember: (id) =>
      set((state) => {
        state.members = state.members.filter((m) => m.id !== id)
      }),

    // ─── Plate ──────────────────────────────────────────────────────────────────
    addPlate: (plate) =>
      set((state) => {
        state.plates.push(plate)
      }),

    updatePlate: (id, partial) =>
      set((state) => {
        const idx = state.plates.findIndex((p) => p.id === id)
        if (idx !== -1) Object.assign(state.plates[idx], partial)
      }),

    removePlate: (id) =>
      set((state) => {
        state.plates = state.plates.filter((p) => p.id !== id)
      }),

    // ─── Material ───────────────────────────────────────────────────────────────
    addMaterial: (material) =>
      set((state) => {
        state.materials.push(material)
      }),

    updateMaterial: (id, partial) =>
      set((state) => {
        const idx = state.materials.findIndex((m) => m.id === id)
        if (idx !== -1) Object.assign(state.materials[idx], partial)
      }),

    removeMaterial: (id) =>
      set((state) => {
        state.materials = state.materials.filter((m) => m.id !== id)
      }),

    // ─── Section ────────────────────────────────────────────────────────────────
    addSection: (section) =>
      set((state) => {
        state.sections.push(section)
      }),

    updateSection: (id, partial) =>
      set((state) => {
        const idx = state.sections.findIndex((s) => s.id === id)
        if (idx !== -1) Object.assign(state.sections[idx], partial)
      }),

    removeSection: (id) =>
      set((state) => {
        state.sections = state.sections.filter((s) => s.id !== id)
      }),

    // ─── Load ───────────────────────────────────────────────────────────────────
    addLoad: (load) =>
      set((state) => {
        state.loads.push(load)
      }),

    removeLoad: (index) =>
      set((state) => {
        state.loads.splice(index, 1)
      }),

    // ─── Utility ────────────────────────────────────────────────────────────────
    nextNodeId: () => {
      const { nodes } = get()
      if (nodes.length === 0) return 1
      return Math.max(...nodes.map((n) => n.id)) + 1
    },

    nextMemberId: () => {
      const { members } = get()
      if (members.length === 0) return 1
      return Math.max(...members.map((m) => m.id)) + 1
    },

    toModelJSON: (): StructuralModel => {
      const { nodes, members, plates, materials, sections, loads } = get()
      return {
        nodes: [...nodes],
        members: [...members],
        plates: [...plates],
        materials: [...materials],
        sections: [...sections],
        loads: [...loads],
      }
    },

    loadFromJSON: (model) =>
      set((state) => {
        state.nodes = model.nodes
        state.members = model.members
        state.plates = model.plates
        state.materials = model.materials
        state.sections = model.sections
        state.loads = model.loads
      }),

    reset: () => set(() => ({ ...emptyState })),
  }))
)
