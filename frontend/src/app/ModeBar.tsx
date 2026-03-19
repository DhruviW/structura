import { useUiStore } from '../store/uiStore'
import type { ActiveMode } from '../store/uiStore'
import { useModelStore } from '../store/modelStore'
import { useResultsStore } from '../store/resultsStore'
import { runLinearStaticAnalysis } from '../api/analyzeApi'

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

interface ModeBarProps {
  onBack?: () => void
}

export function ModeBar({ onBack }: ModeBarProps = {}) {
  const activeMode = useUiStore((s) => s.activeMode)
  const setActiveMode = useUiStore((s) => s.setActiveMode)
  const isAnalyzing = useResultsStore((s) => s.isAnalyzing)
  const setIsAnalyzing = useResultsStore((s) => s.setIsAnalyzing)
  const setResults = useResultsStore((s) => s.setResults)

  async function handleRunAnalysis() {
    const model = useModelStore.getState().toModelJSON()
    setIsAnalyzing(true)
    try {
      const results = await runLinearStaticAnalysis(model)
      setResults(results)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="mode-bar">
      {onBack && (
        <button className="mode-btn" onClick={onBack} title="Back to Projects">
          ← Projects
        </button>
      )}
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
      <button
        className="mode-btn run-btn"
        onClick={handleRunAnalysis}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
      </button>
    </div>
  )
}
