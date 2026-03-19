import { useModelStore } from '../../store/modelStore'
import { LoadArrow3D } from '../elements/LoadArrow3D'

export function LoadsLayer3D() {
  const nodes = useModelStore((s) => s.nodes)
  const loads = useModelStore((s) => s.loads)

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <group>
      {loads.map((load, i) => {
        if (load.type !== 'point') return null
        const node = nodeMap.get(load.node)
        if (!node) return null

        const hasMeaningfulForce = load.Fx !== 0 || load.Fy !== 0 || load.Fz !== 0
        if (!hasMeaningfulForce) return null

        return (
          <LoadArrow3D
            key={i}
            origin={[node.x, node.z, -node.y]}
            force={[load.Fx, load.Fy, load.Fz]}
          />
        )
      })}
    </group>
  )
}
