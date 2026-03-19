export const loadsColumns = [
  { data: 0, title: 'ID', type: 'numeric' as const, readOnly: true },
  { data: 1, title: 'Type', type: 'dropdown' as const, source: ['point', 'distributed', 'moment'] },
  { data: 2, title: 'Target', type: 'numeric' as const },
  { data: 3, title: 'Fx/wx', type: 'numeric' as const },
  { data: 4, title: 'Fy/wy', type: 'numeric' as const },
  { data: 5, title: 'Mz', type: 'numeric' as const },
  { data: 6, title: 'Pattern', type: 'text' as const },
]
export const loadsColumnKeys = ['id', 'type', 'target', 'Fx', 'Fy', 'Mz', 'pattern']
