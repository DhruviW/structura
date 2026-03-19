export const materialsColumns = [
  { data: 0, title: 'ID', type: 'text' as const, readOnly: true },
  { data: 1, title: 'Name', type: 'text' as const },
  { data: 2, title: 'E (Pa)', type: 'numeric' as const },
  { data: 3, title: 'G (Pa)', type: 'numeric' as const },
  { data: 4, title: 'ν', type: 'numeric' as const },
  { data: 5, title: 'ρ (kg/m³)', type: 'numeric' as const },
  { data: 6, title: 'fy (Pa)', type: 'numeric' as const },
]
export const materialsColumnKeys = ['id', 'name', 'E', 'G', 'nu', 'rho', 'fy']
