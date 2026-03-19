import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../../src/store/modelStore'

describe('modelStore', () => {
  beforeEach(() => {
    useModelStore.getState().reset()
  })

  it('starts with empty model', () => {
    const state = useModelStore.getState()
    expect(state.nodes).toEqual([])
    expect(state.members).toEqual([])
    expect(state.plates).toEqual([])
    expect(state.materials).toEqual([])
    expect(state.sections).toEqual([])
    expect(state.loads).toEqual([])
  })

  it('adds a node', () => {
    const { addNode } = useModelStore.getState()
    addNode({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
    const { nodes } = useModelStore.getState()
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toEqual({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
  })

  it('updates a node', () => {
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
    useModelStore.getState().updateNode(1, { x: 5, y: 10 })
    const { nodes } = useModelStore.getState()
    expect(nodes[0].x).toBe(5)
    expect(nodes[0].y).toBe(10)
    expect(nodes[0].restraints).toEqual([1, 1, 1])
  })

  it('removes a node', () => {
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
    useModelStore.getState().removeNode(1)
    expect(useModelStore.getState().nodes).toHaveLength(0)
  })

  it('adds a member', () => {
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
    useModelStore.getState().addNode({ id: 2, x: 3, y: 0, restraints: [0, 1, 0] })
    useModelStore.getState().addMember({ id: 1, i: 1, j: 2, section: 'W10x49', material: 'A36' })
    const { members } = useModelStore.getState()
    expect(members).toHaveLength(1)
    expect(members[0]).toEqual({ id: 1, i: 1, j: 2, section: 'W10x49', material: 'A36' })
  })

  it('adds a material', () => {
    const mat = { id: 'A36', name: 'Steel A36', E: 200e9, G: 77e9, nu: 0.3, rho: 7850, fy: 250e6 }
    useModelStore.getState().addMaterial(mat)
    const { materials } = useModelStore.getState()
    expect(materials).toHaveLength(1)
    expect(materials[0]).toEqual(mat)
  })

  it('generates next node ID', () => {
    const { nextNodeId } = useModelStore.getState()
    // empty → 1
    expect(nextNodeId()).toBe(1)
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, restraints: [0, 0, 0] })
    useModelStore.getState().addNode({ id: 5, x: 1, y: 0, restraints: [0, 0, 0] })
    // max is 5, so next is 6
    expect(useModelStore.getState().nextNodeId()).toBe(6)
  })

  it('exports model as JSON', () => {
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
    const json = useModelStore.getState().toModelJSON()
    expect(json).toHaveProperty('nodes')
    expect(json).toHaveProperty('members')
    expect(json).toHaveProperty('plates')
    expect(json).toHaveProperty('materials')
    expect(json).toHaveProperty('sections')
    expect(json).toHaveProperty('loads')
    expect(json.nodes).toHaveLength(1)
    expect(json.nodes[0]).toEqual({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
  })

  it('loads model from JSON', () => {
    const model = {
      nodes: [{ id: 1, x: 0, y: 0, restraints: [1, 1, 1] as [0 | 1, 0 | 1, 0 | 1] }],
      members: [],
      plates: [],
      materials: [],
      sections: [],
      loads: [],
    }
    useModelStore.getState().loadFromJSON(model)
    expect(useModelStore.getState().nodes).toHaveLength(1)
    expect(useModelStore.getState().nodes[0].id).toBe(1)
  })

  it('generates next member ID', () => {
    expect(useModelStore.getState().nextMemberId()).toBe(1)
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, restraints: [0, 0, 0] })
    useModelStore.getState().addNode({ id: 2, x: 1, y: 0, restraints: [0, 0, 0] })
    useModelStore.getState().addMember({ id: 3, i: 1, j: 2, section: 'S1', material: 'M1' })
    expect(useModelStore.getState().nextMemberId()).toBe(4)
  })
})
