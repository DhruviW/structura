import { useResultsStore } from '../store/resultsStore'
import type { ActiveResultType } from '../store/resultsStore'

const RESULT_TYPE_OPTIONS: { value: ActiveResultType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'moment', label: 'Bending Moment' },
  { value: 'shear', label: 'Shear Force' },
  { value: 'axial', label: 'Axial Force' },
  { value: 'deflected', label: 'Deflected Shape' },
  { value: 'stress', label: 'Plate Stress' },
  { value: 'reactions', label: 'Reactions' },
]

export function ResultsPanel() {
  const results = useResultsStore((s) => s.results)
  const hasResults = useResultsStore((s) => s.hasResults)
  const activeResultType = useResultsStore((s) => s.activeResultType)
  const diagramScale = useResultsStore((s) => s.diagramScale)
  const deflectionMagnification = useResultsStore((s) => s.deflectionMagnification)
  const setActiveResultType = useResultsStore((s) => s.setActiveResultType)
  const setDiagramScale = useResultsStore((s) => s.setDiagramScale)
  const setDeflectionMagnification = useResultsStore((s) => s.setDeflectionMagnification)

  // Compute summary stats
  const maxDispNode = results
    ? results.displacements.reduce<{ node: number; disp: number } | null>((best, d) => {
        const mag = Math.sqrt(d.ux * d.ux + d.uy * d.uy)
        if (!best || mag > best.disp) return { node: d.node, disp: mag }
        return best
      }, null)
    : null

  const numReactions = results ? results.reactions.length : 0
  const numMembersAnalyzed = results ? results.member_forces.length : 0

  return (
    <div className="panel">
      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>
        Results
      </h3>

      {!hasResults && (
        <p style={{ fontSize: 12, color: '#999' }}>Run analysis to view results.</p>
      )}

      {hasResults && (
        <>
          {/* Diagram type selector */}
          <label style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
            Diagram Type
            <select
              value={activeResultType}
              onChange={(e) => setActiveResultType(e.target.value as ActiveResultType)}
              style={{ display: 'block', width: '100%', marginTop: 4, fontSize: 12 }}
            >
              {RESULT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Scale slider */}
          <label style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
            Scale: {diagramScale.toFixed(1)}
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.1}
              value={diagramScale}
              onChange={(e) => setDiagramScale(parseFloat(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>

          {/* Deflection magnification (only shown for deflected shape) */}
          {activeResultType === 'deflected' && (
            <label style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
              Magnification
              <input
                type="number"
                min={1}
                max={1000}
                step={1}
                value={deflectionMagnification}
                onChange={(e) =>
                  setDeflectionMagnification(parseFloat(e.target.value) || 1)
                }
                style={{ display: 'block', width: '100%', marginTop: 4, fontSize: 12 }}
              />
            </label>
          )}

          {/* Summary table */}
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#666' }}>
              Summary
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <tbody>
                <tr>
                  <td style={{ padding: '2px 0', color: '#777' }}>Max disp. node</td>
                  <td style={{ padding: '2px 0', textAlign: 'right', color: '#333' }}>
                    {maxDispNode ? `Node ${maxDispNode.node} (${maxDispNode.disp.toExponential(2)} m)` : '—'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: '#777' }}>Reactions</td>
                  <td style={{ padding: '2px 0', textAlign: 'right', color: '#333' }}>
                    {numReactions}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: '#777' }}>Members analyzed</td>
                  <td style={{ padding: '2px 0', textAlign: 'right', color: '#333' }}>
                    {numMembersAnalyzed}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
