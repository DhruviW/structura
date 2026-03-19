export const platesColumns = [
  { data: 0, title: 'ID', type: 'numeric' as const, readOnly: true },
  { data: 1, title: 'Node 1', type: 'numeric' as const },
  { data: 2, title: 'Node 2', type: 'numeric' as const },
  { data: 3, title: 'Node 3', type: 'numeric' as const },
  { data: 4, title: 'Node 4', type: 'numeric' as const },
  { data: 5, title: 'Thickness', type: 'numeric' as const },
  { data: 6, title: 'Material', type: 'text' as const },
  { data: 7, title: 'Type', type: 'dropdown' as const, source: ['shell', 'membrane'] },
]
export const platesColumnKeys = ['id', 'nodes.0', 'nodes.1', 'nodes.2', 'nodes.3', 'thickness', 'material', 'type']
