import { Canvas } from '@react-three/fiber'
import { CameraController } from './CameraController'
import { Grid3D } from './Grid3D'
import { GeometryLayer3D } from './layers/GeometryLayer3D'
import { LoadsLayer3D } from './layers/LoadsLayer3D'
import { ResultsLayer3D } from './layers/ResultsLayer3D'
import { CanvasClickHandler } from './tools/CanvasClickHandler'
import { ViewModeBar } from './ViewModeBar'
import { useUiStore } from '../store/uiStore'
import { useResultsStore } from '../store/resultsStore'

export function Canvas3D() {
  const layers = useUiStore((s) => s.layers)
  const hasResults = useResultsStore((s) => s.hasResults)
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ViewModeBar />
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: '#fafafa' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <CameraController />
        <Grid3D />
        <CanvasClickHandler />
        {layers.geometry && <GeometryLayer3D />}
        {layers.loads && <LoadsLayer3D />}
        {layers.results && hasResults && <ResultsLayer3D />}
      </Canvas>
    </div>
  )
}
