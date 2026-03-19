import type { StructuralModel } from '../types/model'
import type { AnalysisResults } from '../types/results'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function runLinearStaticAnalysis(model: StructuralModel): Promise<AnalysisResults> {
  const response = await fetch(`${API_BASE}/analyze/linear-static`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(Array.isArray(error.detail) ? error.detail.join(', ') : error.detail)
  }
  return response.json()
}
