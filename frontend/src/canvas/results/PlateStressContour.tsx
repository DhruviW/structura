import { useModelStore } from '../../store/modelStore'
import { useResultsStore } from '../../store/resultsStore'
import type { CoordinateSystem } from '../CoordinateSystem'

interface Props {
  coordSystem: CoordinateSystem
}

function valueToColor(value: number, min: number, max: number): string {
  const range = max - min
  const t = range === 0 ? 0.5 : (value - min) / range

  // blue (0,0,255) → white (255,255,255) → red (255,0,0)
  let r: number, g: number, b: number
  if (t <= 0.5) {
    const s = t / 0.5
    r = Math.round(s * 255)
    g = Math.round(s * 255)
    b = 255
  } else {
    const s = (t - 0.5) / 0.5
    r = 255
    g = Math.round((1 - s) * 255)
    b = Math.round((1 - s) * 255)
  }

  return `rgba(${r},${g},${b},0.6)`
}

export function PlateStressContour({ coordSystem }: Props) {
  const nodes = useModelStore((s) => s.nodes)
  const plates = useModelStore((s) => s.plates)
  const results = useResultsStore((s) => s.results)

  if (!results || results.plate_stresses.length === 0) return null

  const vonMisesValues = results.plate_stresses.map((ps) => ps.von_mises)
  const minVm = Math.min(...vonMisesValues)
  const maxVm = Math.max(...vonMisesValues)

  const stressMap = new Map<number, number>()
  for (const ps of results.plate_stresses) {
    stressMap.set(ps.id, ps.von_mises)
  }

  return (
    <g id="plate-stress-contour">
      {plates.map((plate) => {
        const vm = stressMap.get(plate.id)
        if (vm === undefined) return null

        const plateNodes = plate.nodes.map((nid) => nodes.find((n) => n.id === nid))
        if (plateNodes.some((n) => n === undefined)) return null

        const screenPoints = (plateNodes as NonNullable<typeof plateNodes[0]>[]).map((n) =>
          coordSystem.worldToScreen(n.x, n.y)
        )

        const pointsStr = screenPoints.map((p) => `${p.x},${p.y}`).join(' ')
        const color = valueToColor(vm, minVm, maxVm)

        return (
          <polygon
            key={`stress-plate-${plate.id}`}
            points={pointsStr}
            fill={color}
            stroke="none"
          />
        )
      })}
    </g>
  )
}
