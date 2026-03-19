import { useUiStore } from '../../store/uiStore'
import { useAnnotationStore } from '../../store/annotationStore'

export function handleCircleToolClick(worldX: number, worldY: number) {
  const previewState = useUiStore.getState().previewState
  const center = previewState.circleCenter

  if (center === null) {
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, circleCenter: { x: worldX, y: worldY } },
    }))
    useUiStore.getState().setStatusText('Click a point on the circumference to set radius')
  } else {
    const dx = worldX - center.x
    const dy = worldY - center.y
    const radius = Math.sqrt(dx * dx + dy * dy)

    const id = useAnnotationStore.getState().nextId()
    useAnnotationStore.getState().addAnnotation({
      id,
      type: 'circle',
      center,
      radius,
    })
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, circleCenter: null },
    }))
    useUiStore.getState().setStatusText('Circle added. Click to start another.')
  }
}

export function resetCircleTool() {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, circleCenter: null },
  }))
}
