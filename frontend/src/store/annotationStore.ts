import { create } from 'zustand'
import type { Annotation } from '../types/model'

interface AnnotationState {
  annotations: Annotation[]
  addAnnotation: (a: Annotation) => void
  removeAnnotation: (id: number) => void
  nextId: () => number
  reset: () => void
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  addAnnotation: (a) => set((s) => ({ annotations: [...s.annotations, a] })),
  removeAnnotation: (id) => set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) })),
  nextId: () => {
    const anns = get().annotations
    return anns.length === 0 ? 1 : Math.max(...anns.map((a) => a.id)) + 1
  },
  reset: () => set({ annotations: [] }),
}))
