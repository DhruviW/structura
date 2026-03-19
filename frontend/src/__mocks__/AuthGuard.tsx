// Test stub: AuthGuard renders children directly without any auth check.
import type { ReactNode } from 'react'

export function AuthGuard({ children }: { children: ReactNode }) {
  return <>{children}</>
}
