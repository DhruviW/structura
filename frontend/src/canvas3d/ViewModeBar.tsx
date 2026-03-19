import { useUiStore } from '../store/uiStore'
import type { ViewMode } from '../store/uiStore'

const VIEWS: { mode: ViewMode; label: string }[] = [
  { mode: '3d', label: '3D' },
  { mode: 'plan-xy', label: 'Plan (XY)' },
  { mode: 'elevation-xz', label: 'Elev (XZ)' },
  { mode: 'elevation-yz', label: 'Elev (YZ)' },
]

export function ViewModeBar() {
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)
  return (
    <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, display: 'flex', gap: 4 }}>
      {VIEWS.map(v => (
        <button
          key={v.mode}
          className={`mode-btn${viewMode === v.mode ? ' active' : ''}`}
          onClick={() => setViewMode(v.mode)}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
