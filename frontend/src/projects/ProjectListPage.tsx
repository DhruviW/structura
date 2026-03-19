import { useState, useEffect } from 'react'
import { ProjectCard } from './ProjectCard'
import { useAuthStore } from '../auth/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Project {
  id: string
  name: string
  description?: string
  role: string
  updated_at: string
}

interface ProjectListPageProps {
  onOpenProject: (id: string) => void
}

export function ProjectListPage({ onOpenProject }: ProjectListPageProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const { session, signOut } = useAuthStore()

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = session?.access_token ?? ''
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    })
  }

  async function loadProjects() {
    try {
      setLoading(true)
      setError(null)
      const res = await authFetch('/projects/')
      if (!res.ok) throw new Error(`Failed to load projects (${res.status})`)
      setProjects(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      setCreating(true)
      const res = await authFetch('/projects/', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) throw new Error(`Failed to create project (${res.status})`)
      const project = await res.json()
      setProjects((prev) => [project, ...prev])
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setCreating(false)
    }
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'sans-serif',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Projects</h1>
        <button
          onClick={signOut}
          style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 4, padding: '0.4rem 0.8rem', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="New project name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem', borderRadius: 4, border: '1px solid #d1d5db' }}
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer', borderRadius: 4 }}
        >
          {creating ? 'Creating…' : 'New Project'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 4, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading projects…</p>
      ) : projects.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No projects yet. Create one above.</p>
      ) : (
        <div style={gridStyle}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={onOpenProject} />
          ))}
        </div>
      )}
    </div>
  )
}
