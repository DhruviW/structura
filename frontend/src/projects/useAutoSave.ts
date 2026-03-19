import { useEffect, useRef } from 'react'
import { useModelStore } from '../store/modelStore'
import { useAuthStore } from '../auth/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const INTERVAL_MS = 60_000 // 60 seconds

/**
 * Auto-saves the current model to the backend every 60 seconds.
 * Only saves if the model has changed since the last save.
 */
export function useAutoSave(projectId: string) {
  const lastSavedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    const tick = async () => {
      const { session } = useAuthStore.getState()
      if (!session) return

      const model = useModelStore.getState().toModelJSON()
      const serialized = JSON.stringify(model)

      // Skip if unchanged
      if (serialized === lastSavedRef.current) return

      try {
        const res = await fetch(`${API_URL}/projects/${projectId}/snapshots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ model_json: model, label: 'auto-save' }),
        })
        if (res.ok) {
          lastSavedRef.current = serialized
        }
      } catch {
        // Silently ignore network errors for auto-save
      }
    }

    const id = setInterval(tick, INTERVAL_MS)
    return () => clearInterval(id)
  }, [projectId])
}
