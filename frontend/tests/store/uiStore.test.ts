import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from '../../src/store/uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.getState().reset()
  })

  it('defaults to select mode', () => {
    expect(useUiStore.getState().activeMode).toBe('select')
  })

  it('changes mode', () => {
    useUiStore.getState().setActiveMode('node')
    expect(useUiStore.getState().activeMode).toBe('node')
    useUiStore.getState().setActiveMode('member')
    expect(useUiStore.getState().activeMode).toBe('member')
  })

  it('tracks selection', () => {
    useUiStore.getState().selectElement({ type: 'node', id: 1 })
    useUiStore.getState().selectElement({ type: 'member', id: 2 })
    const { selectedElements } = useUiStore.getState()
    expect(selectedElements).toHaveLength(2)
    expect(selectedElements[0]).toEqual({ type: 'node', id: 1 })
    expect(selectedElements[1]).toEqual({ type: 'member', id: 2 })
  })

  it('clears selection', () => {
    useUiStore.getState().selectElement({ type: 'node', id: 1 })
    useUiStore.getState().clearSelection()
    expect(useUiStore.getState().selectedElements).toHaveLength(0)
  })

  it('toggles layer', () => {
    const initial = useUiStore.getState().layers.loads
    useUiStore.getState().toggleLayer('loads')
    expect(useUiStore.getState().layers.loads).toBe(!initial)
    useUiStore.getState().toggleLayer('loads')
    expect(useUiStore.getState().layers.loads).toBe(initial)
  })

  it('toggles grid snap', () => {
    const initial = useUiStore.getState().gridSnap
    useUiStore.getState().toggleGridSnap()
    expect(useUiStore.getState().gridSnap).toBe(!initial)
    useUiStore.getState().toggleGridSnap()
    expect(useUiStore.getState().gridSnap).toBe(initial)
  })

  it('has correct default layer state', () => {
    const { layers } = useUiStore.getState()
    expect(layers.geometry).toBe(true)
    expect(layers.loads).toBe(true)
    expect(layers.results).toBe(true)
    expect(layers.annotations).toBe(true)
    expect(layers.selection).toBe(true)
  })

  it('has correct default numeric values', () => {
    const state = useUiStore.getState()
    expect(state.gridSize).toBe(1.0)
    expect(state.zoom).toBe(1.0)
    expect(state.panOffset).toEqual({ x: 0, y: 0 })
    expect(state.gridSnap).toBe(true)
  })

  it('sets grid size', () => {
    useUiStore.getState().setGridSize(0.5)
    expect(useUiStore.getState().gridSize).toBe(0.5)
  })

  it('sets zoom', () => {
    useUiStore.getState().setZoom(2.0)
    expect(useUiStore.getState().zoom).toBe(2.0)
  })

  it('sets pan offset', () => {
    useUiStore.getState().setPanOffset({ x: 100, y: -50 })
    expect(useUiStore.getState().panOffset).toEqual({ x: 100, y: -50 })
  })
})
