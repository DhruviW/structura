import { useUiStore } from '../../store/uiStore'
import { useAnnotationStore } from '../../store/annotationStore'

export function handleRectangleToolClick(worldX: number, worldY: number) {
  const previewState = useUiStore.getState().previewState
  const firstCorner = previewState.rectangleFirstCorner

  if (firstCorner === null) {
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, rectangleFirstCorner: { x: worldX, y: worldY } },
    }))
    useUiStore.getState().setStatusText('Click opposite corner to complete rectangle')
  } else {
    const id = useAnnotationStore.getState().nextId()
    useAnnotationStore.getState().addAnnotation({
      id,
      type: 'rectangle',
      corner1: firstCorner,
      corner2: { x: worldX, y: worldY },
    })
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, rectangleFirstCorner: null },
    }))
    useUiStore.getState().setStatusText('Rectangle added. Click to start another.')
  }
}

export function resetRectangleTool() {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, rectangleFirstCorner: null },
  }))
}
