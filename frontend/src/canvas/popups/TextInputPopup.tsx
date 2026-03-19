import { useState } from 'react'
import { useUiStore } from '../../store/uiStore'
import { useAnnotationStore } from '../../store/annotationStore'
import type { CoordinateSystem } from '../CoordinateSystem'

interface TextInputPopupProps {
  coordSystem: CoordinateSystem
}

export function TextInputPopup({ coordSystem }: TextInputPopupProps) {
  const previewState = useUiStore((s) => s.previewState)
  const annotateSubMode = useUiStore((s) => s.annotateSubMode)
  const [textValue, setTextValue] = useState('')

  const { pendingTextPosition, leaderPoint } = previewState

  // Show when we have a pending text position
  if (pendingTextPosition === null) return null

  const screenPos = coordSystem.worldToScreen(pendingTextPosition.x, pendingTextPosition.y)

  const handleSubmit = () => {
    if (!textValue.trim()) return

    const id = useAnnotationStore.getState().nextId()

    if (annotateSubMode === 'leader' && leaderPoint !== null) {
      useAnnotationStore.getState().addAnnotation({
        id,
        type: 'leader',
        point: leaderPoint,
        textPosition: pendingTextPosition,
        text: textValue.trim(),
      })
      useUiStore.setState((s) => ({
        previewState: { ...s.previewState, leaderPoint: null, pendingTextPosition: null },
      }))
    } else {
      useAnnotationStore.getState().addAnnotation({
        id,
        type: 'text',
        position: pendingTextPosition,
        text: textValue.trim(),
        fontSize: 12,
      })
      useUiStore.setState((s) => ({
        previewState: { ...s.previewState, pendingTextPosition: null },
      }))
    }

    setTextValue('')
    useUiStore.getState().setStatusText('Annotation added. Click to add another.')
  }

  const handleCancel = () => {
    useUiStore.setState((s) => ({
      previewState: { ...s.previewState, pendingTextPosition: null, leaderPoint: null },
    }))
    setTextValue('')
  }

  return (
    <div
      className="popup-overlay"
      style={{
        left: screenPos.x + 12,
        top: screenPos.y - 20,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        {annotateSubMode === 'leader' ? 'Leader Text' : 'Annotation Text'}
      </div>
      <input
        autoFocus
        type="text"
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') handleCancel()
        }}
        placeholder="Enter text..."
        style={{ fontSize: 12, width: 140 }}
      />
      <div style={{ marginTop: 6 }}>
        <button onClick={handleSubmit}>Add</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  )
}
