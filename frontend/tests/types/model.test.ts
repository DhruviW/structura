import { describe, it, expect } from 'vitest'
import { isValidNode, isValidMember, isValidMaterial, isValidPlate } from '../../src/types/model'

describe('model type guards', () => {
  it('validates a correct node', () => {
    const node = { id: 1, x: 0.0, y: 0.0, z: 0.0, restraints: [1, 1, 1, 0, 0, 0] as [number, number, number, number, number, number] }
    expect(isValidNode(node)).toBe(true)
  })
  it('rejects node with missing x', () => {
    expect(isValidNode({ id: 1, y: 0.0, z: 0.0, restraints: [1, 1, 1, 0, 0, 0] })).toBe(false)
  })
  it('rejects node with missing z', () => {
    expect(isValidNode({ id: 1, x: 0.0, y: 0.0, restraints: [1, 1, 1, 0, 0, 0] })).toBe(false)
  })
  it('rejects node with 3-element restraints (old format)', () => {
    expect(isValidNode({ id: 1, x: 0.0, y: 0.0, z: 0.0, restraints: [1, 1, 1] })).toBe(false)
  })
  it('validates a correct member', () => {
    const member = { id: 1, i: 1, j: 2, section: 'W10x49', material: 'A36' }
    expect(isValidMember(member)).toBe(true)
  })
  it('validates a correct material', () => {
    const mat = { id: 'A36', name: 'Steel A36', E: 200e9, G: 77e9, nu: 0.3, rho: 7850, fy: 250e6 }
    expect(isValidMaterial(mat)).toBe(true)
  })
  it('validates a correct plate', () => {
    const plate = { id: 1, nodes: [1, 2, 3, 4], thickness: 0.01, material: 'Concrete', type: 'shell' as const }
    expect(isValidPlate(plate)).toBe(true)
  })
  it('rejects plate with invalid type', () => {
    const plate = { id: 1, nodes: [1, 2, 3, 4], thickness: 0.01, material: 'Concrete', type: 'invalid' }
    expect(isValidPlate(plate)).toBe(false)
  })
})
