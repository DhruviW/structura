import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../../src/store/modelStore'
import { exportToXlsx, validateXlsxImport } from '../../src/spreadsheet/xlsxIO'

describe('xlsx I/O', () => {
  beforeEach(() => {
    useModelStore.getState().reset()
  })

  it('exports model to xlsx workbook with correct sheet names', () => {
    useModelStore.getState().addNode({ id: 1, x: 0, y: 0, restraints: [1, 1, 1] })
    const wb = exportToXlsx()
    expect(wb.SheetNames).toContain('Nodes')
    expect(wb.SheetNames).toContain('Members')
    expect(wb.SheetNames).toContain('Materials')
    expect(wb.SheetNames).toHaveLength(7)
  })

  it('validates import: rejects missing required tab', () => {
    const result = validateXlsxImport({ SheetNames: ['Nodes', 'Members'] } as any)
    expect(result.valid).toBe(false)
  })

  it('validates import: accepts complete workbook', () => {
    const wb = exportToXlsx()
    const result = validateXlsxImport(wb)
    expect(result.valid).toBe(true)
  })
})
