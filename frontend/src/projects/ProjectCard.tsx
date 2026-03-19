interface Project {
  id: string
  name: string
  description?: string
  role: string
  updated_at: string
}

interface ProjectCardProps {
  project: Project
  onOpen: (id: string) => void
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const formattedDate = new Date(project.updated_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '1.25rem',
    cursor: 'pointer',
    background: '#fff',
    transition: 'box-shadow 0.15s',
  }

  return (
    <div
      style={cardStyle}
      onClick={() => onOpen(project.id)}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{project.name}</h3>
      {project.description && (
        <p style={{ margin: '0 0 0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
          {project.description}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af' }}>
        <span style={{ textTransform: 'capitalize' }}>{project.role}</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  )
}
