import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { CameraController } from './CameraController'
import { Grid3D } from './Grid3D'
import { GeometryLayer3D } from './layers/GeometryLayer3D'
import { LoadsLayer3D } from './layers/LoadsLayer3D'
import { ResultsLayer3D } from './layers/ResultsLayer3D'
import { CanvasClickHandler } from './tools/CanvasClickHandler'
import { ViewModeBar } from './ViewModeBar'
import { useUiStore } from '../store/uiStore'
import { useResultsStore } from '../store/resultsStore'
import { useModelStore } from '../store/modelStore'
import { handleSupportToolClick } from '../canvas/tools/SupportTool'
import { handleLoadToolClick } from '../canvas/tools/LoadTool'
import type { SupportType } from '../types/model'

function SupportPanel3D() {
  const pendingSupportNodeId = useUiStore((s) => s.pendingSupportNodeId)
  const setPendingSupportNodeId = useUiStore((s) => s.setPendingSupportNodeId)

  if (pendingSupportNodeId === null) return null

  const supportTypes: SupportType[] = ['pin', 'roller', 'fixed', 'none']

  const handleSelect = (type: SupportType) => {
    handleSupportToolClick(pendingSupportNodeId, type)
    setPendingSupportNodeId(null)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 12,
        zIndex: 20,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: '10px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Support Type</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {supportTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleSelect(type)}
            style={{ fontSize: 12, padding: '4px 8px', cursor: 'pointer' }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setPendingSupportNodeId(null)}
          style={{ fontSize: 12, padding: '4px 8px', cursor: 'pointer', marginTop: 4 }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function LoadPanel3D() {
  const pendingLoadNodeId = useUiStore((s) => s.pendingLoadNodeId)
  const setPendingLoadNodeId = useUiStore((s) => s.setPendingLoadNodeId)
  const nodes = useModelStore((s) => s.nodes)

  const [Fx, setFx] = useState('0')
  const [Fy, setFy] = useState('0')
  const [Fz, setFz] = useState('0')
  const [Mx, setMx] = useState('0')
  const [My, setMy] = useState('0')
  const [Mz, setMz] = useState('0')

  if (pendingLoadNodeId === null) return null

  const node = nodes.find((n) => n.id === pendingLoadNodeId)
  if (!node) return null

  const handleApply = () => {
    handleLoadToolClick(
      pendingLoadNodeId,
      parseFloat(Fx) || 0,
      parseFloat(Fy) || 0,
      parseFloat(Fz) || 0,
      parseFloat(Mx) || 0,
      parseFloat(My) || 0,
      parseFloat(Mz) || 0,
    )
    setPendingLoadNodeId(null)
    setFx('0')
    setFy('0')
    setFz('0')
    setMx('0')
    setMy('0')
    setMz('0')
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 12,
        zIndex: 20,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: '10px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
        Apply Load — Node {node.id}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {([
          ['Fx (kN)', Fx, setFx],
          ['Fy (kN)', Fy, setFy],
          ['Fz (kN)', Fz, setFz],
          ['Mx (kNm)', Mx, setMx],
          ['My (kNm)', My, setMy],
          ['Mz (kNm)', Mz, setMz],
        ] as [string, string, (v: string) => void][]).map(([label, value, setter]) => (
          <label key={label} style={{ fontSize: 11 }}>
            {label}:
            <input
              type="number"
              value={value}
              onChange={(e) => setter(e.target.value)}
              style={{ marginLeft: 6, width: 70, fontSize: 11 }}
            />
          </label>
        ))}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
        <button onClick={handleApply} style={{ fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}>
          Apply
        </button>
        <button
          onClick={() => setPendingLoadNodeId(null)}
          style={{ fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export function Canvas3D() {
  const layers = useUiStore((s) => s.layers)
  const hasResults = useResultsStore((s) => s.hasResults)
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ViewModeBar />
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: '#fafafa' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <CameraController />
        <Grid3D />
        <CanvasClickHandler />
        {layers.geometry && <GeometryLayer3D />}
        {layers.loads && <LoadsLayer3D />}
        {layers.results && hasResults && <ResultsLayer3D />}
      </Canvas>
      {/* HTML overlays rendered outside Canvas but inside the relative container */}
      <SupportPanel3D />
      <LoadPanel3D />
    </div>
  )
}
