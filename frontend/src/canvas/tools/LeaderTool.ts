import { useUiStore } from '../../store/uiStore'

export function handleLeaderToolClick(worldX: number, worldY: number) {
  const previewState = useUiStore.getState().previewState
  const leaderPoint = previewState.leaderPoint

  if (leaderPoint === null) {
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, leaderPoint: { x: worldX, y: worldY } },
    }))
    useUiStore.getState().setStatusText('Click text position for leader annotation')
  } else {
    // Set text position — open popup via pendingTextPosition; keep leaderPoint for context
    useUiStore.setState((s) => ({
      previewState: {
        ...s.previewState,
        pendingTextPosition: { x: worldX, y: worldY },
      },
    }))
    useUiStore.getState().setStatusText('Enter leader annotation text')
  }
}

export function resetLeaderTool() {
  useUiStore.setState((s) => ({
    previewState: { ...s.previewState, leaderPoint: null, pendingTextPosition: null },
  }))
}
