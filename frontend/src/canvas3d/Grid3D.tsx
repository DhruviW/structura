export function Grid3D() {
  return (
    <group>
      <gridHelper args={[100, 100, '#bbb', '#e0e0e0']} />
      <axesHelper args={[3]} />
    </group>
  )
}
