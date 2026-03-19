import { useUiStore } from '../store/uiStore'
import type { ActiveMode } from '../store/uiStore'

interface ModeButton {
  mode: ActiveMode
  label: string
  shortcut: string
}

const MODE_BUTTONS: ModeButton[] = [
  { mode: 'select', label: 'Select', shortcut: 'V' },
  { mode: 'node', label: 'Node', shortcut: 'N' },
  { mode: 'member', label: 'Member', shortcut: 'M' },
  { mode: 'plate', label: 'Plate', shortcut: 'P' },
  { mode: 'support', label: 'Support', shortcut: 'S' },
  { mode: 'load', label: 'Load', shortcut: 'L' },
  { mode: 'dimension', label: 'Dimension', shortcut: 'D' },
  { mode: 'annotate', label: 'Annotate', shortcut: 'A' },
]

export function ModeBar() {
  const activeMode = useUiStore((s) => s.activeMode)
  const setActiveMode = useUiStore((s) => s.setActiveMode)

  return (
    <div className="mode-bar">
      {MODE_BUTTONS.map(({ mode, label, shortcut }) => (
        <button
          key={mode}
          className={`mode-btn${activeMode === mode ? ' active' : ''}`}
          onClick={() => setActiveMode(mode)}
          title={`${label} (${shortcut})`}
        >
          {label} ({shortcut})
        </button>
      ))}
      <div className="mode-bar-spacer" />
      <button className="mode-btn run-btn" onClick={() => {}}>
        Run Analysis
      </button>
    </div>
  )
}
