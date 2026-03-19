import { useModelStore } from '../../store/modelStore'

export function handleLoadToolClick(
  nodeId: number,
  Fx: number,
  Fy: number,
  Fz: number,
  Mx: number,
  My: number,
  Mz: number,
) {
  const store = useModelStore.getState()
  store.addLoad({ type: 'point', node: nodeId, Fx, Fy, Fz, Mx, My, Mz })
}
