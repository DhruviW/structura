import { useModelStore } from '../store/modelStore'
import type { Restraints } from '../types/model'

type StoreUnsubscribe = () => void

export class SyncEngine {
  private listeners: Array<() => void> = []
  private unsubscribe: StoreUnsubscribe | null = null
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private debounceMs = 150
  isSyncingFromSpreadsheet = false

  onStoreChange(listener: () => void): void {
    this.listeners.push(listener)
  }

  start(): void {
    this.unsubscribe = useModelStore.subscribe(() => {
      if (this.isSyncingFromSpreadsheet) return
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null
        this.listeners.forEach((fn) => fn())
      }, this.debounceMs)
    })
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  applySpreadsheetChange(tab: string, rowIndex: number, column: string, value: unknown): void {
    this.isSyncingFromSpreadsheet = true
    try {
      const store = useModelStore.getState()

      switch (tab) {
        case 'nodes': {
          const node = store.nodes[rowIndex]
          if (!node) break
          if (column === 'id' || column === 'x' || column === 'y' || column === 'z') {
            store.updateNode(node.id, { [column]: value } as Partial<typeof node>)
          } else if (column === 'restraints') {
            store.updateNode(node.id, { restraints: value as Restraints })
          }
          break
        }
        case 'members': {
          const member = store.members[rowIndex]
          if (!member) break
          store.updateMember(member.id, { [column]: value } as Parameters<typeof store.updateMember>[1])
          break
        }
        case 'plates': {
          const plate = store.plates[rowIndex]
          if (!plate) break
          store.updatePlate(plate.id, { [column]: value } as Parameters<typeof store.updatePlate>[1])
          break
        }
        case 'materials': {
          const material = store.materials[rowIndex]
          if (!material) break
          store.updateMaterial(material.id, { [column]: value } as Parameters<typeof store.updateMaterial>[1])
          break
        }
        case 'sections': {
          const section = store.sections[rowIndex]
          if (!section) break
          store.updateSection(section.id, { [column]: value } as Parameters<typeof store.updateSection>[1])
          break
        }
        case 'loads': {
          // Loads use index-based removal/addition; direct field update not supported via store
          // This is a best-effort passthrough — no updateLoad action exists in the store
          break
        }
        default:
          break
      }
    } finally {
      this.isSyncingFromSpreadsheet = false
    }
  }

  getTabData(tab: string): unknown[][] {
    const store = useModelStore.getState()

    switch (tab) {
      case 'nodes':
        return store.nodes.map((n) => {
          // Derive support type from restraints [Ux, Uy, Uz, Rx, Ry, Rz]
          const [ux, uy, uz, rx, ry, rz] = n.restraints
          let supportType: string
          if (ux === 1 && uy === 1 && uz === 1 && rx === 1 && ry === 1 && rz === 1) supportType = 'fixed'
          else if (ux === 1 && uy === 1 && rz === 0) supportType = 'pin'
          else if (ux === 0 && uy === 1 && rz === 0) supportType = 'roller'
          else supportType = 'none'
          return [n.id, n.x, n.y, n.z, supportType, ux, uy, uz, rx, ry, rz]
        })

      case 'members':
        return store.members.map((m) => [m.id, m.i, m.j, m.section, m.material])

      case 'plates':
        return store.plates.map((p) => [p.id, p.nodes[0], p.nodes[1], p.nodes[2], p.nodes[3], p.thickness, p.material, p.type])

      case 'materials':
        return store.materials.map((m) => [m.id, m.name, m.E, m.G, m.nu, m.rho, m.fy])

      case 'sections':
        return store.sections.map((s) => [s.id, s.name, s.A, s.Iz, s.Iy, s.J, s.Sz, s.Sy])

      case 'loads':
        return store.loads.map((l) => {
          if (l.type === 'point') {
            return [undefined, 'point', l.node, l.Fx, l.Fy, l.Mz, undefined]
          } else if (l.type === 'distributed') {
            return [undefined, 'distributed', l.member, l.wx, l.wy, undefined, undefined]
          } else {
            return [undefined, 'moment', l.node, undefined, undefined, l.Mz, undefined]
          }
        })

      default:
        return []
    }
  }
}

export const syncEngine = new SyncEngine()
