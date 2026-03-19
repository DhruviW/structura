import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../../../src/store/modelStore'
import { handleNodeToolClick } from '../../../src/canvas/tools/NodeTool'

describe('NodeTool', () => {
  beforeEach(() => {
    useModelStore.getState().reset()
  })

  it('creates a node on click at world coordinates', () => {
    handleNodeToolClick(3, 5)
    const nodes = useModelStore.getState().nodes
    expect(nodes).toHaveLength(1)
    expect(nodes[0].x).toBe(3)
    expect(nodes[0].y).toBe(5)
    expect(nodes[0].z).toBe(0)
    expect(nodes[0].restraints).toEqual([0, 0, 0, 0, 0, 0])
  })

  it('auto-increments node IDs', () => {
    handleNodeToolClick(0, 0)
    handleNodeToolClick(1, 1)
    handleNodeToolClick(2, 2)
    const nodes = useModelStore.getState().nodes
    expect(nodes).toHaveLength(3)
    expect(nodes[0].id).toBe(1)
    expect(nodes[1].id).toBe(2)
    expect(nodes[2].id).toBe(3)
  })
})
