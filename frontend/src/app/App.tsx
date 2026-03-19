import { useState } from 'react'
import { Layout } from './Layout'
import { AuthGuard } from '../auth/AuthGuard'
import { ProjectListPage } from '../projects/ProjectListPage'

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

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
