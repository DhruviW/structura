import { useUiStore } from '../../store/uiStore'
import { useAnnotationStore } from '../../store/annotationStore'

export function handleDimensionToolClick(worldX: number, worldY: number) {
  const previewState = useUiStore.getState().previewState
  const firstPoint = previewState.dimensionFirstPoint

  if (firstPoint === null) {
    // Set first point
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, dimensionFirstPoint: { x: worldX, y: worldY } },
    }))
    useUiStore.getState().setStatusText('Click second point to set dimension endpoint')
  } else {
    // Create dimension annotation
    const dx = worldX - firstPoint.x
    const dy = worldY - firstPoint.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const text = dist.toFixed(2) + ' m'

    const id = useAnnotationStore.getState().nextId()
    useAnnotationStore.getState().addAnnotation({
      id,
      type: 'dimension',
      p1: firstPoint,
      p2: { x: worldX, y: worldY },
      offset: 0.5,
      text,
    })

    // Reset first point
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, dimensionFirstPoint: null },
    }))
    useUiStore.getState().setStatusText('Dimension added. Click to start another.')
  }
}

export function resetDimensionTool() {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, dimensionFirstPoint: null },
  }))
}
