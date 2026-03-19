import { useEffect } from 'react'
import { useUiStore } from '../../store/uiStore'
import { undoRedoManager } from '../../sync/undoRedo'
import { deleteSelectedElements } from '../tools/deleteUtils'

function isEditableElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select'
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip when focus is inside an editable element
      if (isEditableElement(document.activeElement)) return

      const isMeta = e.metaKey || e.ctrlKey

      // Undo: Ctrl+Z / Cmd+Z (without Shift)
      if (isMeta && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undoRedoManager.undo()
        return
      }

      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
      if (isMeta && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undoRedoManager.redo()
        return
      }

      // Skip other shortcuts if modifier keys are held
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const { setActiveMode, clearPreview, clearSelection, setPendingSupportNodeId, setPendingLoadNodeId } =
        useUiStore.getState()

      switch (e.key) {
        case 'v':
          setActiveMode('select')
          break
        case 'n':
          setActiveMode('node')
          break
        case 'm':
          setActiveMode('member')
          break
        case 'p':
          setActiveMode('plate')
          break
        case 's':
          setActiveMode('support')
          break
        case 'l':
          setActiveMode('load')
          break
        case 'd':
          setActiveMode('dimension')
          break
        case 'a':
          setActiveMode('annotate')
          break
        case 'Escape':
          setActiveMode('select')
          clearPreview()
          clearSelection()
          setPendingSupportNodeId(null)
          setPendingLoadNodeId(null)
          break
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          deleteSelectedElements()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
