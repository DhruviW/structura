export const nodesColumns = [
  { data: 0, title: 'ID', type: 'numeric' as const, readOnly: true },
  { data: 1, title: 'X', type: 'numeric' as const },
  { data: 2, title: 'Y', type: 'numeric' as const },
  { data: 3, title: 'Z', type: 'numeric' as const },
  { data: 4, title: 'Support', type: 'dropdown' as const, source: ['none', 'pin', 'roller', 'fixed'] },
  { data: 5, title: 'Ux', type: 'numeric' as const },
  { data: 6, title: 'Uy', type: 'numeric' as const },
  { data: 7, title: 'Uz', type: 'numeric' as const },
  { data: 8, title: 'Rx', type: 'numeric' as const },
  { data: 9, title: 'Ry', type: 'numeric' as const },
  { data: 10, title: 'Rz', type: 'numeric' as const },
]
export const nodesColumnKeys = ['id', 'x', 'y', 'z', 'supportType', 'restraints.0', 'restraints.1', 'restraints.2', 'restraints.3', 'restraints.4', 'restraints.5']
