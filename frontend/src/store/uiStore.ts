import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ActiveMode =
  | 'select'
  | 'node'
  | 'member'
  | 'plate'
  | 'support'
  | 'load'
  | 'dimension'
  | 'annotate'

export type LayerName = 'geometry' | 'loads' | 'results' | 'annotations' | 'selection'

export interface SelectedElement {
  type: 'node' | 'member' | 'plate'
  id: number
}

export interface Layers {
  geometry: boolean
  loads: boolean
  results: boolean
  annotations: boolean
  selection: boolean
}

interface UiState {
  activeMode: ActiveMode
  selectedElements: SelectedElement[]
  layers: Layers
  gridSnap: boolean
  gridSize: number
  zoom: number
  panOffset: { x: number; y: number }
}

interface UiActions {
  setActiveMode: (mode: ActiveMode) => void
  selectElement: (element: SelectedElement) => void
  clearSelection: () => void
  toggleLayer: (layer: LayerName) => void
  toggleGridSnap: () => void
  setGridSize: (size: number) => void
  setZoom: (zoom: number) => void
  setPanOffset: (offset: { x: number; y: number }) => void
  reset: () => void
}

const defaultState: UiState = {
  activeMode: 'select',
  selectedElements: [],
  layers: {
    geometry: true,
    loads: true,
    results: true,
    annotations: true,
    selection: true,
  },
  gridSnap: true,
  gridSize: 1.0,
  zoom: 1.0,
  panOffset: { x: 0, y: 0 },
}

export const useUiStore = create<UiState & UiActions>()(
  immer((set) => ({
    ...defaultState,

    setActiveMode: (mode) =>
      set((state) => {
        state.activeMode = mode
      }),

    selectElement: (element) =>
      set((state) => {
        state.selectedElements.push(element)
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedElements = []
      }),

    toggleLayer: (layer) =>
      set((state) => {
        state.layers[layer] = !state.layers[layer]
      }),

    toggleGridSnap: () =>
      set((state) => {
        state.gridSnap = !state.gridSnap
      }),

    setGridSize: (size) =>
      set((state) => {
        state.gridSize = size
      }),

    setZoom: (zoom) =>
      set((state) => {
        state.zoom = zoom
      }),

    setPanOffset: (offset) =>
      set((state) => {
        state.panOffset = offset
      }),

    reset: () =>
      set(() => ({
        ...defaultState,
        layers: { ...defaultState.layers },
        selectedElements: [],
        panOffset: { ...defaultState.panOffset },
      })),
  }))
)
