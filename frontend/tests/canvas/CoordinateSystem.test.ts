import { describe, it, expect } from 'vitest'
import { CoordinateSystem } from '../../src/canvas/CoordinateSystem'

describe('CoordinateSystem', () => {
  const viewport = { width: 800, height: 600 }

  it('maps world origin to viewport center when no transform', () => {
    const cs = new CoordinateSystem(1, { x: 0, y: 0 }, viewport)
    const screen = cs.worldToScreen(0, 0)
    expect(screen.x).toBe(400)
    expect(screen.y).toBe(300)
  })

  it('round-trips screenToWorld(worldToScreen(x, y)) back to original', () => {
    const cs = new CoordinateSystem(1.5, { x: 20, y: -30 }, viewport)
    const wx = 3.5
    const wy = -2.1
    const screen = cs.worldToScreen(wx, wy)
    const world = cs.screenToWorld(screen.x, screen.y)
    expect(world.x).toBeCloseTo(wx, 10)
    expect(world.y).toBeCloseTo(wy, 10)
  })

  it('at 2x zoom worldToScreen(1, 0) is further right than center', () => {
    const cs = new CoordinateSystem(2, { x: 0, y: 0 }, viewport)
    const screen = cs.worldToScreen(1, 0)
    const center = viewport.width / 2
    expect(screen.x).toBeGreaterThan(center)
  })

  it('pan offset shifts worldToScreen(0,0) by panOffset', () => {
    const cs = new CoordinateSystem(1, { x: 100, y: 0 }, viewport)
    const screen = cs.worldToScreen(0, 0)
    expect(screen.x).toBe(500) // 400 + 100
    expect(screen.y).toBe(300)
  })

  it('snaps (1.3, 2.7) with gridSize=1 to (1, 3)', () => {
    const cs = new CoordinateSystem(1, { x: 0, y: 0 }, viewport)
    const snapped = cs.snapToGrid(1.3, 2.7, 1)
    expect(snapped.x).toBe(1)
    expect(snapped.y).toBe(3)
  })

  it('Y-axis inverted: worldToScreen(0,1) has smaller screen Y than worldToScreen(0,0)', () => {
    const cs = new CoordinateSystem(1, { x: 0, y: 0 }, viewport)
    const above = cs.worldToScreen(0, 1)
    const origin = cs.worldToScreen(0, 0)
    expect(above.y).toBeLessThan(origin.y)
  })

  it('snaps with fractional grid size', () => {
    const cs = new CoordinateSystem(1, { x: 0, y: 0 }, viewport)
    const snapped = cs.snapToGrid(1.13, 2.87, 0.5)
    expect(snapped.x).toBeCloseTo(1.0, 10)
    expect(snapped.y).toBeCloseTo(3.0, 10)
  })

  it('applies zoom factor correctly for non-zero world coords', () => {
    const cs1 = new CoordinateSystem(1, { x: 0, y: 0 }, viewport)
    const cs2 = new CoordinateSystem(2, { x: 0, y: 0 }, viewport)
    const s1 = cs1.worldToScreen(3, 0)
    const s2 = cs2.worldToScreen(3, 0)
    const center = viewport.width / 2
    // at 2x zoom, offset from center should be double
    expect(s2.x - center).toBeCloseTo(2 * (s1.x - center), 10)
  })
})
