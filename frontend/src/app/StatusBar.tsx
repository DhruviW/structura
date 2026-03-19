import { useUiStore } from '../store/uiStore'

export function StatusBar() {
  const activeMode = useUiStore((s) => s.activeMode)
  const previewState = useUiStore((s) => s.previewState)

  return (
    <div className="status-bar">
      <span className="status-mode">{activeMode.toUpperCase()}</span>
      {previewState.statusText && (
        <span className="status-text">{previewState.statusText}</span>
      )}
      {previewState.cursorWorldPos && (
        <span className="status-coords">
          X: {previewState.cursorWorldPos.x.toFixed(2)} Y: {previewState.cursorWorldPos.y.toFixed(2)}
        </span>
      )}
    </div>
  )
}
