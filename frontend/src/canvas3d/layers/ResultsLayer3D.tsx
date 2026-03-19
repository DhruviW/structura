import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useModelStore } from '../../store/modelStore'
import { useResultsStore } from '../../store/resultsStore'

// ─── Deflected Shape ─────────────────────────────────────────────────────────

function DeflectedShape() {
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const results = useResultsStore((s) => s.results)
  const magnification = useResultsStore((s) => s.deflectionMagnification)

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes])

  if (!results?.displacements) return null

  const dispMap = new Map(results.displacements.map(d => [d.node, d]))

  return (
    <group>
      {members.map(m => {
        const ni = nodeMap.get(m.i)
        const nj = nodeMap.get(m.j)
        if (!ni || !nj) return null

        const di = dispMap.get(m.i)
        const dj = dispMap.get(m.j)

        // Displaced positions = original + displacement * magnification
        // Map to Three.js coords: ThreeX=WorldX, ThreeY=WorldZ, ThreeZ=-WorldY
        const siX = ni.x + (di ? di.ux * magnification : 0)
        const siY = ni.z + (di ? di.uz * magnification : 0)
        const siZ = -(ni.y + (di ? di.uy * magnification : 0))

        const sjX = nj.x + (dj ? dj.ux * magnification : 0)
        const sjY = nj.z + (dj ? dj.uz * magnification : 0)
        const sjZ = -(nj.y + (dj ? dj.uy * magnification : 0))

        const points: [number, number, number][] = [
          [siX, siY, siZ],
          [sjX, sjY, sjZ],
        ]

        return (
          <Line
            key={m.id}
            points={points}
            color="#FF6B35"
            lineWidth={2}
            dashed
            dashSize={0.15}
            gapSize={0.08}
          />
        )
      })}
    </group>
  )
}

// ─── Reaction Arrows ──────────────────────────────────────────────────────────

interface ReactionArrowProps {
  origin: [number, number, number]
  force: [number, number, number]
  scale?: number
}

function ReactionArrow({ origin, force, scale = 1.0 }: ReactionArrowProps) {
  const { shaftPoints, headPos, headRot } = useMemo(() => {
    const [fx, fy, fz] = force
    // Map from structural (Z-up) to Three.js (Y-up): X→X, Z→Y, -Y→Z
    const dir3 = new THREE.Vector3(fx, fz, -fy)
    const mag = dir3.length()
    if (mag === 0) return { shaftPoints: null, headPos: null, headRot: null }

    dir3.normalize()
    const arrowLen = scale * 0.8
    const tipPos = new THREE.Vector3(...origin).addScaledVector(dir3, arrowLen)

    const shaft: [number, number, number][] = [
      origin,
      tipPos.toArray() as [number, number, number],
    ]

    const quat = new THREE.Quaternion()
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir3)
    const euler = new THREE.Euler().setFromQuaternion(quat)

    return {
      shaftPoints: shaft,
      headPos: tipPos.addScaledVector(dir3, 0.06).toArray() as [number, number, number],
      headRot: [euler.x, euler.y, euler.z] as [number, number, number],
    }
  }, [origin, force, scale])

  if (!shaftPoints || !headPos || !headRot) return null

  return (
    <group>
      <Line points={shaftPoints} color="#4CAF50" lineWidth={2.5} />
      <mesh position={headPos} rotation={headRot}>
        <coneGeometry args={[0.05, 0.14, 8]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
    </group>
  )
}

function ReactionsLayer() {
  const nodes = useModelStore((s) => s.nodes)
  const results = useResultsStore((s) => s.results)
  const activeResultType = useResultsStore((s) => s.activeResultType)

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes])

  if (!results?.reactions || activeResultType !== 'reactions') return null

  return (
    <group>
      {results.reactions.map(r => {
        const node = nodeMap.get(r.node)
        if (!node) return null

        // Three.js coords: ThreeX=WorldX, ThreeY=WorldZ, ThreeZ=-WorldY
        const origin: [number, number, number] = [node.x, node.z, -node.y]
        const force: [number, number, number] = [r.Fx, r.Fy, r.Fz]
        const mag = Math.sqrt(r.Fx ** 2 + r.Fy ** 2 + r.Fz ** 2)
        if (mag === 0) return null

        return (
          <ReactionArrow
            key={r.node}
            origin={origin}
            force={force}
            scale={1.2}
          />
        )
      })}
    </group>
  )
}

// ─── Main ResultsLayer3D ──────────────────────────────────────────────────────

export function ResultsLayer3D() {
  const activeResultType = useResultsStore((s) => s.activeResultType)

  return (
    <group>
      {activeResultType === 'deflected' && <DeflectedShape />}
      <ReactionsLayer />
    </group>
  )
}
