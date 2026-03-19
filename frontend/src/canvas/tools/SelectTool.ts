import type { SelectedElement } from '../../store/uiStore'
import { useUiStore } from '../../store/uiStore'

export type ElementRef = SelectedElement

export function handleSelectToolClick(ref: ElementRef | null) {
  const ui = useUiStore.getState()
  ui.clearSelection()
  if (ref) {
    ui.selectElement(ref)
  }
}
