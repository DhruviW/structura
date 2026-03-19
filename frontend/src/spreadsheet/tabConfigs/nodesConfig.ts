export const nodesColumns = [
  { data: 0, title: 'ID', type: 'numeric' as const, readOnly: true },
  { data: 1, title: 'X', type: 'numeric' as const },
  { data: 2, title: 'Y', type: 'numeric' as const },
  { data: 3, title: 'Support', type: 'dropdown' as const, source: ['none', 'pin', 'roller', 'fixed'] },
  { data: 4, title: 'Ux', type: 'numeric' as const },
  { data: 5, title: 'Uy', type: 'numeric' as const },
  { data: 6, title: 'Rz', type: 'numeric' as const },
]
export const nodesColumnKeys = ['id', 'x', 'y', 'supportType', 'restraints.0', 'restraints.1', 'restraints.2']
