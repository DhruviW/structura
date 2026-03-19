import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { AnalysisResults } from '../types/results'

export type ActiveResultType =
  | 'moment'
  | 'shear'
  | 'axial'
  | 'deflected'
  | 'stress'
  | 'reactions'
  | 'none'

interface ResultsState {
  results: AnalysisResults | null
  hasResults: boolean
  activeResultType: ActiveResultType
  diagramScale: number
  deflectionMagnification: number
  isAnalyzing: boolean
}

interface ResultsActions {
  setResults: (results: AnalysisResults) => void
  setActiveResultType: (type: ActiveResultType) => void
  setDiagramScale: (scale: number) => void
  setDeflectionMagnification: (mag: number) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  clear: () => void
}

const defaultState: ResultsState = {
  results: null,
  hasResults: false,
  activeResultType: 'none',
  diagramScale: 1.0,
  deflectionMagnification: 10.0,
  isAnalyzing: false,
}

export const useResultsStore = create<ResultsState & ResultsActions>()(
  immer((set) => ({
    ...defaultState,

    setResults: (results) =>
      set((state) => {
        state.results = results
        state.hasResults = true
      }),

    setActiveResultType: (type) =>
      set((state) => {
        state.activeResultType = type
      }),

    setDiagramScale: (scale) =>
      set((state) => {
        state.diagramScale = scale
      }),

    setDeflectionMagnification: (mag) =>
      set((state) => {
        state.deflectionMagnification = mag
      }),

    setIsAnalyzing: (isAnalyzing) =>
      set((state) => {
        state.isAnalyzing = isAnalyzing
      }),

    clear: () =>
      set(() => ({
        ...defaultState,
      })),
  }))
)
