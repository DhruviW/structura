import { describe, it, expect, beforeEach } from 'vitest'
import { UndoRedoManager, type Command } from '../../src/sync/undoRedo'

describe('UndoRedoManager', () => {
  let manager: UndoRedoManager
  let value: number

  const makeCmd = (from: number, to: number): Command => ({
    execute: () => { value = to },
    undo: () => { value = from },
    description: `set ${from} → ${to}`,
  })

  beforeEach(() => {
    manager = new UndoRedoManager()
    value = 0
  })

  it('executes a command', () => {
    manager.execute(makeCmd(0, 1))
    expect(value).toBe(1)
    expect(manager.canUndo).toBe(true)
  })

  it('undoes a command', () => {
    manager.execute(makeCmd(0, 1))
    manager.undo()
    expect(value).toBe(0)
    expect(manager.canUndo).toBe(false)
    expect(manager.canRedo).toBe(true)
  })

  it('redoes a command', () => {
    manager.execute(makeCmd(0, 1))
    manager.undo()
    manager.redo()
    expect(value).toBe(1)
  })

  it('clears redo stack on new command after undo', () => {
    manager.execute(makeCmd(0, 1))
    manager.execute(makeCmd(1, 2))
    manager.undo()
    manager.execute(makeCmd(1, 3))
    expect(value).toBe(3)
    expect(manager.canRedo).toBe(false)
  })
})
