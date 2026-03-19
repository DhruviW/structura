import { useModelStore } from '../../store/modelStore'

const selectedNodes: number[] = []

export function handlePlateToolClick(nodeId: number) {
  selectedNodes.push(nodeId)
  if (selectedNodes.length === 4) {
    const store = useModelStore.getState()
    const id =
      store.plates.length === 0
        ? 1
        : Math.max(...store.plates.map((p) => p.id)) + 1
    store.addPlate({
      id,
      nodes: [selectedNodes[0], selectedNodes[1], selectedNodes[2], selectedNodes[3]],
      thickness: 0.1,
      material: 'default',
      type: 'shell',
    })
    selectedNodes.length = 0
  }
}

export function resetPlateTool() {
  selectedNodes.length = 0
}

export function getPlateToolState() {
  return { selectedNodes: [...selectedNodes] }
}
