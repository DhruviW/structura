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
export type AnnotateSubMode = 'text' | 'leader' | 'dimension' | 'line' | 'polyline' | 'rectangle' | 'circle'

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

export interface PreviewState {
  memberFirstNodeId: number | null
  plateSelectedNodeIds: number[]
  cursorWorldPos: { x: number; y: number } | null
  nearestNodeId: number | null
  statusText: string
  dimensionFirstPoint: { x: number; y: number } | null
  lineFirstPoint: { x: number; y: number } | null
  polylinePoints: { x: number; y: number }[]
  rectangleFirstCorner: { x: number; y: number } | null
  circleCenter: { x: number; y: number } | null
  leaderPoint: { x: number; y: number } | null
  pendingTextPosition: { x: number; y: number } | null
}

export interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

interface UiState {
  activeMode: ActiveMode
  annotateSubMode: AnnotateSubMode
  selectedElements: SelectedElement[]
  layers: Layers
  gridSnap: boolean
  gridSize: number
  zoom: number
  panOffset: { x: number; y: number }
  previewState: PreviewState
  pendingSupportNodeId: number | null
  pendingLoadNodeId: number | null
  selectionBox: SelectionBox | null
}

interface UiActions {
  setActiveMode: (mode: ActiveMode) => void
  setAnnotateSubMode: (mode: AnnotateSubMode) => void
  selectElement: (element: SelectedElement) => void
  clearSelection: () => void
  toggleLayer: (layer: LayerName) => void
  toggleGridSnap: () => void
  setGridSize: (size: number) => void
  setZoom: (zoom: number) => void
  setPanOffset: (offset: { x: number; y: number }) => void
  reset: () => void
  // Preview actions
  setPreviewMemberFirstNode: (id: number | null) => void
  setPreviewPlateNodes: (ids: number[]) => void
  setCursorWorldPos: (pos: { x: number; y: number } | null) => void
  setNearestNodeId: (id: number | null) => void
  setStatusText: (text: string) => void
  setPendingSupportNodeId: (id: number | null) => void
  setPendingLoadNodeId: (id: number | null) => void
  clearPreview: () => void
  // Selection box actions
  setSelectionBox: (box: SelectionBox | null) => void
  clearSelectionBox: () => void
}

const defaultPreviewState: PreviewState = {
  memberFirstNodeId: null,
  plateSelectedNodeIds: [],
  cursorWorldPos: null,
  nearestNodeId: null,
  statusText: '',
  dimensionFirstPoint: null,
  lineFirstPoint: null,
  polylinePoints: [],
  rectangleFirstCorner: null,
  circleCenter: null,
  leaderPoint: null,
  pendingTextPosition: null,
}

const defaultState: UiState = {
  activeMode: 'select',
  annotateSubMode: 'text',
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
  previewState: { ...defaultPreviewState, plateSelectedNodeIds: [] },
  pendingSupportNodeId: null,
  pendingLoadNodeId: null,
  selectionBox: null,
}

export const useUiStore = create<UiState & UiActions>()(
  immer((set) => ({
    ...defaultState,

    setActiveMode: (mode) =>
      set((state) => {
        state.activeMode = mode
      }),

    setAnnotateSubMode: (mode) =>
      set((state) => {
        state.annotateSubMode = mode
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
        previewState: { ...defaultPreviewState, plateSelectedNodeIds: [], polylinePoints: [] },
        pendingSupportNodeId: null,
        pendingLoadNodeId: null,
        selectionBox: null,
      })),

    // Preview actions
    setPreviewMemberFirstNode: (id) =>
      set((state) => {
        state.previewState.memberFirstNodeId = id
      }),

    setPreviewPlateNodes: (ids) =>
      set((state) => {
        state.previewState.plateSelectedNodeIds = ids
      }),

    setCursorWorldPos: (pos) =>
      set((state) => {
        state.previewState.cursorWorldPos = pos
      }),

    setNearestNodeId: (id) =>
      set((state) => {
        state.previewState.nearestNodeId = id
      }),

    setStatusText: (text) =>
      set((state) => {
        state.previewState.statusText = text
      }),

    setPendingSupportNodeId: (id) =>
      set((state) => {
        state.pendingSupportNodeId = id
      }),

    setPendingLoadNodeId: (id) =>
      set((state) => {
        state.pendingLoadNodeId = id
      }),

    clearPreview: () =>
      set((state) => {
        state.previewState = { ...defaultPreviewState, plateSelectedNodeIds: [], polylinePoints: [] }
        state.pendingSupportNodeId = null
        state.pendingLoadNodeId = null
      }),

    setSelectionBox: (box) =>
      set((state) => {
        state.selectionBox = box
      }),

    clearSelectionBox: () =>
      set((state) => {
        state.selectionBox = null
      }),
  }))
)
