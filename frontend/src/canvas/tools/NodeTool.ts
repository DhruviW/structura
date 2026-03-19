import { useModelStore } from '../../store/modelStore'

export function handleNodeToolClick(worldX: number, worldY: number) {
  const store = useModelStore.getState()
  const id = store.nextNodeId()
  store.addNode({ id, x: worldX, y: worldY, z: 0, restraints: [0, 0, 0, 0, 0, 0] })
}
