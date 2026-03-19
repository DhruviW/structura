import { Grid } from '@react-three/drei'
import { useUiStore } from '../store/uiStore'

export function Grid3D() {
  const gridSize = useUiStore((s) => s.gridSize)
  return (
    <Grid
      args={[100, 100]}
      cellSize={gridSize}
      sectionSize={gridSize * 5}
      cellColor="#e0e0e0"
      sectionColor="#bbb"
      fadeDistance={50}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
}
