import { useUiStore } from '../../store/uiStore'
import { useAnnotationStore } from '../../store/annotationStore'

export function handlePolylineToolClick(worldX: number, worldY: number) {
  const points = useUiStore.getState().previewState.polylinePoints

  useUiStore.setState((s) => ({
    previewState: {
      ...s.previewState,
      polylinePoints: [...s.previewState.polylinePoints, { x: worldX, y: worldY }],
    },
  }))
  useUiStore.getState().setStatusText(`${points.length + 1} point(s). Double-click to finish.`)
}

export function handlePolylineToolDoubleClick() {
  const points = useUiStore.getState().previewState.polylinePoints
  if (points.length >= 2) {
    const id = useAnnotationStore.getState().nextId()
    useAnnotationStore.getState().addAnnotation({
      id,
      type: 'polyline',
      points,
      closed: false,
    })
  }
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, polylinePoints: [] },
  }))
  useUiStore.getState().setStatusText('Polyline added. Click to start another.')
}

export function resetPolylineTool() {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, polylinePoints: [] },
  }))
}
