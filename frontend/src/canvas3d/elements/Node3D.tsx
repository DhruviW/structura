interface Node3DProps {
  position: [number, number, number]
  id: number
  selected: boolean
  onClick?: () => void
}

export function Node3D({ position, id: _id, selected, onClick }: Node3DProps) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.() }}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={selected ? '#2196F3' : '#333'} />
      </mesh>
      {/* TODO: add HTML label for node ID */}
    </group>
  )
}
