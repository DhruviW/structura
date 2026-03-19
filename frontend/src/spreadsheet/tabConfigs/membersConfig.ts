export const membersColumns = [
  { data: 0, title: 'ID', type: 'numeric' as const, readOnly: true },
  { data: 1, title: 'Start Node', type: 'numeric' as const },
  { data: 2, title: 'End Node', type: 'numeric' as const },
  { data: 3, title: 'Section', type: 'text' as const },
  { data: 4, title: 'Material', type: 'text' as const },
]
export const membersColumnKeys = ['id', 'i', 'j', 'section', 'material']
