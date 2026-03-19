import { useState } from 'react'
import { Layout } from './Layout'
import { AuthGuard } from '../auth/AuthGuard'
import { ProjectListPage } from '../projects/ProjectListPage'
import { isSupabaseConfigured } from '../auth/supabaseClient'

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  // Dev mode: skip auth + project routing, go straight to editor
  if (!isSupabaseConfigured) {
    return <Layout />
  }

  return (
    <AuthGuard>
      {activeProjectId ? (
        <Layout projectId={activeProjectId} onBack={() => setActiveProjectId(null)} />
      ) : (
        <ProjectListPage onOpenProject={setActiveProjectId} />
      )}
    </AuthGuard>
  )
}
