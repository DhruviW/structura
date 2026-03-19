import { useModelStore } from '../../store/modelStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { LoadArrow } from '../elements/LoadArrow'
import type { PointLoad } from '../../types/model'

interface LoadsLayerProps {
  coordSystem: CoordinateSystem
}

export function LoadsLayer({ coordSystem }: LoadsLayerProps) {
  const nodes = useModelStore((s) => s.nodes)
  const loads = useModelStore((s) => s.loads)

  return (
    <g id="layer-loads">
      {loads.map((load, index) => {
        if (load.type === 'point') {
          const pointLoad = load as PointLoad
          const node = nodes.find((n) => n.id === pointLoad.node)
          if (!node) return null
          const pos = coordSystem.worldToScreen(node.x, node.y)
          return (
            <LoadArrow
              key={`load-${index}`}
              screenX={pos.x}
              screenY={pos.y}
              Fx={pointLoad.Fx}
              Fy={pointLoad.Fy}
            />
          )
        }

        // TODO: add later
        // if (load.type === 'distributed') { ... }
        // if (load.type === 'moment') { ... }
        return null
      })}
    </g>
  )
}
