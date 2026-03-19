import { useUiStore } from '../../store/uiStore'
import { useAnnotationStore } from '../../store/annotationStore'

export function handleLineToolClick(worldX: number, worldY: number) {
  const previewState = useUiStore.getState().previewState
  const firstPoint = previewState.lineFirstPoint

  if (firstPoint === null) {
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, lineFirstPoint: { x: worldX, y: worldY } },
    }))
    useUiStore.getState().setStatusText('Click second point to complete the line')
  } else {
    const id = useAnnotationStore.getState().nextId()
    useAnnotationStore.getState().addAnnotation({
      id,
      type: 'line',
      p1: firstPoint,
      p2: { x: worldX, y: worldY },
    })
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, lineFirstPoint: null },
    }))
    useUiStore.getState().setStatusText('Line added. Click to start another.')
  }
}

export function resetLineTool() {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, lineFirstPoint: null },
  }))
}
