import { useUiStore } from '../store/uiStore'
import type { LayerName } from '../store/uiStore'

interface LayerEntry {
  key: LayerName
  label: string
}

const LAYERS: LayerEntry[] = [
  { key: 'geometry', label: 'Geometry' },
  { key: 'loads', label: 'Loads' },
  { key: 'results', label: 'Results' },
  { key: 'annotations', label: 'Annotations' },
]

export function LayersPanel() {
  const layers = useUiStore((s) => s.layers)
  const toggleLayer = useUiStore((s) => s.toggleLayer)

  return (
    <div className="panel">
      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>
        Layers
      </h3>
      {LAYERS.map(({ key, label }) => (
        <label
          key={key}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4, cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={() => toggleLayer(key)}
          />
          {label}
        </label>
      ))}
    </div>
  )
}
