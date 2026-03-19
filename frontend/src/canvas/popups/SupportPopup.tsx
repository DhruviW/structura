import { useUiStore } from '../../store/uiStore'
import { useModelStore } from '../../store/modelStore'
import { handleSupportToolClick } from '../tools/SupportTool'
import type { SupportType } from '../../types/model'
import type { CoordinateSystem } from '../CoordinateSystem'

interface SupportPopupProps {
  coordSystem: CoordinateSystem
}

export function SupportPopup({ coordSystem }: SupportPopupProps) {
  const pendingSupportNodeId = useUiStore((s) => s.pendingSupportNodeId)
  const setPendingSupportNodeId = useUiStore((s) => s.setPendingSupportNodeId)
  const nodes = useModelStore((s) => s.nodes)

  if (pendingSupportNodeId === null) return null

  const node = nodes.find((n) => n.id === pendingSupportNodeId)
  if (!node) return null

  const screenPos = coordSystem.worldToScreen(node.x, node.y)

  const handleSelect = (type: SupportType) => {
    handleSupportToolClick(pendingSupportNodeId, type)
    setPendingSupportNodeId(null)
  }

  const supportTypes: SupportType[] = ['pin', 'roller', 'fixed', 'none']

  return (
    <div
      className="popup-overlay"
      style={{
        left: screenPos.x + 12,
        top: screenPos.y - 20,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Support Type</div>
      {supportTypes.map((type) => (
        <button key={type} onClick={() => handleSelect(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
      <button onClick={() => setPendingSupportNodeId(null)} style={{ marginLeft: 4 }}>
        Cancel
      </button>
    </div>
  )
}
