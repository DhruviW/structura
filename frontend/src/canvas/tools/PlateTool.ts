import { useModelStore } from '../../store/modelStore'
import { useUiStore } from '../../store/uiStore'

export function handlePlateToolClick(nodeId: number) {
  const ui = useUiStore.getState()
  const current = ui.previewState.plateSelectedNodeIds
  const next = [...current, nodeId]
  if (next.length === 4) {
    const store = useModelStore.getState()
    const id =
      store.plates.length === 0
        ? 1
        : Math.max(...store.plates.map((p) => p.id)) + 1
    store.addPlate({
      id,
      nodes: [next[0], next[1], next[2], next[3]],
      thickness: 0.1,
      material: 'default',
      type: 'shell',
    })
    ui.setPreviewPlateNodes([])
    ui.setStatusText('')
  } else {
    ui.setPreviewPlateNodes(next)
    ui.setStatusText(`Select node ${next.length + 1} of 4 for plate`)
  }
}

export function resetPlateTool() {
  const ui = useUiStore.getState()
  ui.setPreviewPlateNodes([])
  ui.setStatusText('')
}

export function getPlateToolState() {
  return { selectedNodes: [...useUiStore.getState().previewState.plateSelectedNodeIds] }
}
