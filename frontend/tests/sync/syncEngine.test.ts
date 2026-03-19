import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SyncEngine } from '../../src/sync/syncEngine'
import { useModelStore } from '../../src/store/modelStore'

describe('SyncEngine', () => {
  let engine: SyncEngine

  beforeEach(() => {
    useModelStore.getState().reset()
    engine = new SyncEngine()
  })

  it('notifies listeners when store changes', async () => {
    const listener = vi.fn()
    engine.onStoreChange(listener)
    engine.start()
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, z: 0, restraints: [0, 0, 0, 0, 0, 0] })
    await new Promise((r) => setTimeout(r, 200))  // wait for 150ms debounce
    expect(listener).toHaveBeenCalled()
    engine.stop()
  })

  it('applies spreadsheet changes to store', () => {
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, z: 0, restraints: [0, 0, 0, 0, 0, 0] })
    engine.applySpreadsheetChange('nodes', 0, 'x', 5.0)
    expect(useModelStore.getState().nodes[0].x).toBe(5.0)
  })

  it('debounces rapid store changes', async () => {
    const listener = vi.fn()
    engine.onStoreChange(listener)
    engine.start()
    for (let i = 1; i <= 5; i++) {
      useModelStore.getState().addNode({ id: i, x: i, y: 0, z: 0, restraints: [0, 0, 0, 0, 0, 0] })
    }
    await new Promise((r) => setTimeout(r, 200))
    expect(listener.mock.calls.length).toBeLessThanOrEqual(2)
    engine.stop()
  })
})
