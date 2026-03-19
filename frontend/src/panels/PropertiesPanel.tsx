import { useUiStore } from '../store/uiStore'
import { useModelStore } from '../store/modelStore'

export function PropertiesPanel() {
  const selectedElements = useUiStore((s) => s.selectedElements)
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const updateNode = useModelStore((s) => s.updateNode)
  const updateMember = useModelStore((s) => s.updateMember)

  if (selectedElements.length === 0) {
    return (
      <div className="panel">
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>
          Properties
        </h3>
        <p style={{ fontSize: 12, color: '#999' }}>Select an element</p>
      </div>
    )
  }

  const sel = selectedElements[0]

  if (sel.type === 'node') {
    const node = nodes.find((n) => n.id === sel.id)
    if (!node) return null

    return (
      <div className="panel">
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>
          Node {node.id}
        </h3>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
          X
          <input
            type="number"
            value={node.x}
            onChange={(e) => updateNode(node.id, { x: parseFloat(e.target.value) || 0 })}
            style={{ marginLeft: 8, width: 80, fontSize: 12 }}
          />
        </label>
        <label style={{ display: 'block', fontSize: 12 }}>
          Y
          <input
            type="number"
            value={node.y}
            onChange={(e) => updateNode(node.id, { y: parseFloat(e.target.value) || 0 })}
            style={{ marginLeft: 8, width: 80, fontSize: 12 }}
          />
        </label>
      </div>
    )
  }

  if (sel.type === 'member') {
    const member = members.find((m) => m.id === sel.id)
    if (!member) return null

    return (
      <div className="panel">
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>
          Member {member.id}
        </h3>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
          Section
          <input
            type="text"
            value={member.section}
            onChange={(e) => updateMember(member.id, { section: e.target.value })}
            style={{ marginLeft: 8, width: 100, fontSize: 12 }}
          />
        </label>
        <label style={{ display: 'block', fontSize: 12 }}>
          Material
          <input
            type="text"
            value={member.material}
            onChange={(e) => updateMember(member.id, { material: e.target.value })}
            style={{ marginLeft: 8, width: 100, fontSize: 12 }}
          />
        </label>
      </div>
    )
  }

  return (
    <div className="panel">
      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>
        Properties
      </h3>
      <p style={{ fontSize: 12, color: '#999' }}>Select an element</p>
    </div>
  )
}
