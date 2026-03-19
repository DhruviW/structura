import { useResultsStore } from '../../store/resultsStore'
import { MomentDiagram } from './MomentDiagram'
import { ShearDiagram } from './ShearDiagram'
import { AxialDiagram } from './AxialDiagram'
import { DeflectedShape } from './DeflectedShape'
import { PlateStressContour } from './PlateStressContour'
import { ReactionArrows } from './ReactionArrows'
import type { CoordinateSystem } from '../CoordinateSystem'

interface Props {
  coordSystem: CoordinateSystem
}

export function ResultsLayer({ coordSystem }: Props) {
  const activeResultType = useResultsStore((s) => s.activeResultType)
  const hasResults = useResultsStore((s) => s.hasResults)

  if (!hasResults) return null

  return (
    <g id="layer-results">
      {activeResultType === 'moment' && <MomentDiagram coordSystem={coordSystem} />}
      {activeResultType === 'shear' && <ShearDiagram coordSystem={coordSystem} />}
      {activeResultType === 'axial' && <AxialDiagram coordSystem={coordSystem} />}
      {activeResultType === 'deflected' && <DeflectedShape coordSystem={coordSystem} />}
      {activeResultType === 'stress' && <PlateStressContour coordSystem={coordSystem} />}
      {activeResultType === 'reactions' && <ReactionArrows coordSystem={coordSystem} />}
    </g>
  )
}
