import { useState } from 'react'
import { useUiStore } from '../../store/uiStore'
import { useModelStore } from '../../store/modelStore'
import { handleLoadToolClick } from '../tools/LoadTool'
import type { CoordinateSystem } from '../CoordinateSystem'

interface LoadPopupProps {
  coordSystem: CoordinateSystem
}

export function LoadPopup({ coordSystem }: LoadPopupProps) {
  const pendingLoadNodeId = useUiStore((s) => s.pendingLoadNodeId)
  const setPendingLoadNodeId = useUiStore((s) => s.setPendingLoadNodeId)
  const nodes = useModelStore((s) => s.nodes)

  const [Fx, setFx] = useState('0')
  const [Fy, setFy] = useState('0')
  const [Mz, setMz] = useState('0')

  if (pendingLoadNodeId === null) return null

  const node = nodes.find((n) => n.id === pendingLoadNodeId)
  if (!node) return null

  const screenPos = coordSystem.worldToScreen(node.x, node.y)

  const handleApply = () => {
    handleLoadToolClick(pendingLoadNodeId, parseFloat(Fx) || 0, parseFloat(Fy) || 0, parseFloat(Mz) || 0)
    setPendingLoadNodeId(null)
    setFx('0')
    setFy('0')
    setMz('0')
  }

  return (
    <div
      className="popup-overlay"
      style={{
        left: screenPos.x + 12,
        top: screenPos.y - 20,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Apply Load</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11 }}>
          Fx (kN):
          <input
            type="number"
            value={Fx}
            onChange={(e) => setFx(e.target.value)}
          />
        </label>
        <label style={{ fontSize: 11 }}>
          Fy (kN):
          <input
            type="number"
            value={Fy}
            onChange={(e) => setFy(e.target.value)}
          />
        </label>
        <label style={{ fontSize: 11 }}>
          Mz (kNm):
          <input
            type="number"
            value={Mz}
            onChange={(e) => setMz(e.target.value)}
          />
        </label>
      </div>
      <div style={{ marginTop: 6 }}>
        <button onClick={handleApply}>Apply</button>
        <button onClick={() => setPendingLoadNodeId(null)}>Cancel</button>
      </div>
    </div>
  )
}
