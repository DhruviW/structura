import { type ReactNode, useEffect } from 'react'
import { useAuthStore } from './authStore'
import { LoginPage } from './LoginPage'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) return <div>Loading...</div>
  if (!user) return <LoginPage />
  return <>{children}</>
}
