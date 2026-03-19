import { useAnnotationStore } from '../../store/annotationStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { DimensionElement } from '../elements/DimensionElement'
import { TextElement } from '../elements/TextElement'
import { LeaderElement } from '../elements/LeaderElement'
import { LineElement } from '../elements/LineElement'
import { PolylineElement } from '../elements/PolylineElement'
import { RectangleElement } from '../elements/RectangleElement'
import { CircleElement } from '../elements/CircleElement'

interface AnnotationsLayerProps {
  coordSystem: CoordinateSystem
}

export function AnnotationsLayer({ coordSystem }: AnnotationsLayerProps) {
  const annotations = useAnnotationStore((s) => s.annotations)

  return (
    <g id="layer-annotations">
      {annotations.map((ann) => {
        switch (ann.type) {
          case 'dimension':
            return (
              <DimensionElement
                key={ann.id}
                p1={ann.p1}
                p2={ann.p2}
                offset={ann.offset}
                text={ann.text}
                coordSystem={coordSystem}
              />
            )
          case 'text':
            return (
              <TextElement
                key={ann.id}
                position={ann.position}
                text={ann.text}
                fontSize={ann.fontSize}
                coordSystem={coordSystem}
              />
            )
          case 'leader':
            return (
              <LeaderElement
                key={ann.id}
                point={ann.point}
                textPosition={ann.textPosition}
                text={ann.text}
                coordSystem={coordSystem}
              />
            )
          case 'line':
            return (
              <LineElement
                key={ann.id}
                p1={ann.p1}
                p2={ann.p2}
                coordSystem={coordSystem}
              />
            )
          case 'polyline':
            return (
              <PolylineElement
                key={ann.id}
                points={ann.points}
                closed={ann.closed}
                coordSystem={coordSystem}
              />
            )
          case 'rectangle':
            return (
              <RectangleElement
                key={ann.id}
                corner1={ann.corner1}
                corner2={ann.corner2}
                coordSystem={coordSystem}
              />
            )
          case 'circle':
            return (
              <CircleElement
                key={ann.id}
                center={ann.center}
                radius={ann.radius}
                coordSystem={coordSystem}
              />
            )
          default:
            return null
        }
      })}
    </g>
  )
}
