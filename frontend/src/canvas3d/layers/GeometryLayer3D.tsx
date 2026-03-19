import { useModelStore } from '../../store/modelStore'
import { useUiStore } from '../../store/uiStore'
import { Node3D } from '../elements/Node3D'
import { Member3D } from '../elements/Member3D'
import { Support3D } from '../elements/Support3D'

export function GeometryLayer3D() {
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const selectedElements = useUiStore((s) => s.selectedElements)

  const isSelected = (type: string, id: number) =>
    selectedElements.some(el => el.type === type && el.id === id)

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <group>
      {members.map(m => {
        const ni = nodeMap.get(m.i)
        const nj = nodeMap.get(m.j)
        if (!ni || !nj) return null
        return (
          <Member3D
            key={m.id}
            id={m.id}
            // Three.js Y-up mapping: Three X = World X, Three Y = World Z, Three Z = -World Y
            start={[ni.x, ni.z, -ni.y]}
            end={[nj.x, nj.z, -nj.y]}
            selected={isSelected('member', m.id)}
          />
        )
      })}
      {nodes.map(n => (
        <group key={n.id}>
          <Node3D
            id={n.id}
            position={[n.x, n.z, -n.y]}
            selected={isSelected('node', n.id)}
          />
          {n.restraints.some(r => r === 1) && (
            <Support3D
              position={[n.x, n.z, -n.y]}
              type={
                n.restraints[0] === 1 && n.restraints[1] === 1 && n.restraints[2] === 1 &&
                n.restraints[3] === 1 && n.restraints[4] === 1 && n.restraints[5] === 1
                  ? 'fixed'
                  : n.restraints[0] === 1 && n.restraints[1] === 1 && n.restraints[2] === 1
                    ? 'pin'
                    : 'roller'
              }
            />
          )}
        </group>
      ))}
    </group>
  )
}
