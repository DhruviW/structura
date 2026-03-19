import { useUiStore } from '../../store/uiStore'

export function handleTextToolClick(worldX: number, worldY: number) {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, pendingTextPosition: { x: worldX, y: worldY } },
  }))
  useUiStore.getState().setStatusText('Enter annotation text')
}

export function resetTextTool() {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, pendingTextPosition: null },
  }))
}
