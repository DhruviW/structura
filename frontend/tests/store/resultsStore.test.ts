import { describe, it, expect, beforeEach } from 'vitest'
import { useResultsStore } from '../../src/store/resultsStore'
import type { AnalysisResults } from '../../src/types/results'

const mockResults: AnalysisResults = {
  displacements: [{ node: 1, ux: 0.001, uy: -0.002, rz: 0.0001 }],
  member_forces: [{ id: 1, N: [100, -100], V: [50, -50], M: [0, 200] }],
  reactions: [{ node: 1, Fx: -100, Fy: 500, Mz: 0 }],
  plate_stresses: [],
}

describe('resultsStore', () => {
  beforeEach(() => {
    useResultsStore.getState().clear()
  })

  it('starts with no results', () => {
    const state = useResultsStore.getState()
    expect(state.results).toBeNull()
    expect(state.hasResults).toBe(false)
    expect(state.activeResultType).toBe('none')
    expect(state.diagramScale).toBe(1.0)
    expect(state.deflectionMagnification).toBe(10.0)
    expect(state.isAnalyzing).toBe(false)
  })

  it('loads results and sets hasResults to true', () => {
    useResultsStore.getState().setResults(mockResults)
    const state = useResultsStore.getState()
    expect(state.results).toEqual(mockResults)
    expect(state.hasResults).toBe(true)
  })

  it('tracks active result type', () => {
    useResultsStore.getState().setActiveResultType('moment')
    expect(useResultsStore.getState().activeResultType).toBe('moment')
    useResultsStore.getState().setActiveResultType('shear')
    expect(useResultsStore.getState().activeResultType).toBe('shear')
    useResultsStore.getState().setActiveResultType('reactions')
    expect(useResultsStore.getState().activeResultType).toBe('reactions')
  })

  it('clears results', () => {
    useResultsStore.getState().setResults(mockResults)
    useResultsStore.getState().setActiveResultType('axial')
    useResultsStore.getState().clear()
    const state = useResultsStore.getState()
    expect(state.results).toBeNull()
    expect(state.hasResults).toBe(false)
    expect(state.activeResultType).toBe('none')
  })

  it('sets diagram scale', () => {
    useResultsStore.getState().setDiagramScale(2.5)
    expect(useResultsStore.getState().diagramScale).toBe(2.5)
  })

  it('sets deflection magnification', () => {
    useResultsStore.getState().setDeflectionMagnification(50)
    expect(useResultsStore.getState().deflectionMagnification).toBe(50)
  })

  it('sets isAnalyzing', () => {
    useResultsStore.getState().setIsAnalyzing(true)
    expect(useResultsStore.getState().isAnalyzing).toBe(true)
    useResultsStore.getState().setIsAnalyzing(false)
    expect(useResultsStore.getState().isAnalyzing).toBe(false)
  })
})
