import React from 'react'
import { useAnnotationStore } from '../../store/annotationStore'
import { useUiStore } from '../../store/uiStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { DimensionElement } from '../elements/DimensionElement'
import { TextElement } from '../elements/TextElement'
import { LeaderElement } from '../elements/LeaderElement'
import { LineElement } from '../elements/LineElement'
import { PolylineElement } from '../elements/PolylineElement'
import { RectangleElement } from '../elements/RectangleElement'
import { CircleElement } from '../elements/CircleElement'
import { handleEraseAnnotation } from '../tools/EraseTool'
import type { Annotation } from '../../types/model'

interface AnnotationsLayerProps {
  coordSystem: CoordinateSystem
}

function renderAnnotation(ann: Annotation, coordSystem: CoordinateSystem) {
  switch (ann.type) {
    case 'dimension':
      return <DimensionElement p1={ann.p1} p2={ann.p2} offset={ann.offset} text={ann.text} coordSystem={coordSystem} />
    case 'text':
      return <TextElement position={ann.position} text={ann.text} fontSize={ann.fontSize} coordSystem={coordSystem} />
    case 'leader':
      return <LeaderElement point={ann.point} textPosition={ann.textPosition} text={ann.text} coordSystem={coordSystem} />
    case 'line':
      return <LineElement p1={ann.p1} p2={ann.p2} coordSystem={coordSystem} />
    case 'polyline':
      return <PolylineElement points={ann.points} closed={ann.closed} coordSystem={coordSystem} />
    case 'rectangle':
      return <RectangleElement corner1={ann.corner1} corner2={ann.corner2} coordSystem={coordSystem} />
    case 'circle':
      return <CircleElement center={ann.center} radius={ann.radius} coordSystem={coordSystem} />
    default:
      return null
  }
}

export function AnnotationsLayer({ coordSystem }: AnnotationsLayerProps) {
  const annotations = useAnnotationStore((s) => s.annotations)
  const activeMode = useUiStore((s) => s.activeMode)
  const isEraseMode = activeMode === 'erase'

  return (
    <g id="layer-annotations" style={{ pointerEvents: isEraseMode ? 'all' : 'none' }}>
      {annotations.map((ann) => (
        <g
          key={ann.id}
          onClick={isEraseMode ? (e: React.MouseEvent) => { e.stopPropagation(); handleEraseAnnotation(ann.id) } : undefined}
          style={{
            cursor: isEraseMode ? 'pointer' : 'default',
            pointerEvents: isEraseMode ? 'all' : 'none',
          }}
        >
          {renderAnnotation(ann, coordSystem)}
        </g>
      ))}
    </g>
  )
}
