import { useModelStore } from '../store/modelStore'
import type { Material } from '../types/model'

const PRESETS: Material[] = [
  { id: 'A36', name: 'Steel A36', E: 200e9, G: 77.2e9, nu: 0.3, rho: 7850, fy: 250e6 },
  { id: 'A572', name: 'Steel A572-50', E: 200e9, G: 77.2e9, nu: 0.3, rho: 7850, fy: 345e6 },
  { id: 'S275', name: 'Steel S275', E: 210e9, G: 80.8e9, nu: 0.3, rho: 7850, fy: 275e6 },
  { id: 'S355', name: 'Steel S355', E: 210e9, G: 80.8e9, nu: 0.3, rho: 7850, fy: 355e6 },
  { id: 'C25', name: 'Concrete C25', E: 31e9, G: 12.9e9, nu: 0.2, rho: 2400, fy: 25e6 },
  { id: 'C30', name: 'Concrete C30', E: 33e9, G: 13.8e9, nu: 0.2, rho: 2400, fy: 30e6 },
  { id: 'C40', name: 'Concrete C40', E: 35e9, G: 14.6e9, nu: 0.2, rho: 2400, fy: 40e6 },
  { id: 'Timber', name: 'Structural Timber', E: 12e9, G: 0.75e9, nu: 0.35, rho: 500, fy: 30e6 },
  { id: 'Aluminum', name: 'Aluminum 6061-T6', E: 68.9e9, G: 26e9, nu: 0.33, rho: 2700, fy: 276e6 },
]

function formatE(value: number): string {
  return `${(value / 1e9).toFixed(1)} GPa`
}

function formatFy(value: number): string {
  return `${(value / 1e6).toFixed(0)} MPa`
}

export function MaterialLibrary() {
  const materials = useModelStore((s) => s.materials)
  const addMaterial = useModelStore((s) => s.addMaterial)
  const removeMaterial = useModelStore((s) => s.removeMaterial)

  const activeMaterialIds = new Set(materials.map((m) => m.id))

  return (
    <div className="panel">
      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>
        Material Library
      </h3>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Presets</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {PRESETS.map((preset) => {
            const alreadyAdded = activeMaterialIds.has(preset.id)
            return (
              <button
                key={preset.id}
                disabled={alreadyAdded}
                onClick={() => addMaterial(preset)}
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  border: '1px solid #ccc',
                  borderRadius: 3,
                  background: alreadyAdded ? '#e8e8e8' : 'white',
                  color: alreadyAdded ? '#aaa' : '#333',
                  cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}
              >
                {preset.name}
              </button>
            )
          })}
        </div>
      </div>

      {materials.length > 0 && (
        <div>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Active Materials</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {materials.map((mat) => (
              <div
                key={mat.id}
                style={{
                  fontSize: 11,
                  padding: '4px 6px',
                  border: '1px solid #ddd',
                  borderRadius: 3,
                  background: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#333' }}>{mat.name}</div>
                  <div style={{ color: '#666' }}>
                    E: {formatE(mat.E)} | fy: {formatFy(mat.fy)}
                  </div>
                </div>
                <button
                  onClick={() => removeMaterial(mat.id)}
                  style={{
                    fontSize: 11,
                    padding: '1px 5px',
                    border: '1px solid #e57373',
                    borderRadius: 3,
                    background: 'white',
                    color: '#e57373',
                    cursor: 'pointer',
                    flexShrink: 0,
                    marginLeft: 4,
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
