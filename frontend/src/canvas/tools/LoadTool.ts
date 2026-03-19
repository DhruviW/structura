import { useModelStore } from '../../store/modelStore'

export function handleLoadToolClick(nodeId: number, Fx: number, Fy: number, Mz: number) {
  const store = useModelStore.getState()
  store.addLoad({ type: 'point', node: nodeId, Fx, Fy, Mz })
}
