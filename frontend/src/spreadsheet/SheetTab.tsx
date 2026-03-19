import { useRef, useEffect } from 'react'
import { HotTable, HotTableClass } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import { syncEngine } from '../sync/syncEngine'

registerAllModules()

interface ColumnDef {
  data: number
  title: string
  type: string
  readOnly?: boolean
  source?: string[]
}

interface SheetTabProps {
  tabKey: string
  columns: ColumnDef[]
  columnKeys: string[]
  data: unknown[][]
  readOnly?: boolean
}

export function SheetTab({ tabKey, columns, columnKeys, data, readOnly = false }: SheetTabProps) {
  const hotRef = useRef<HotTableClass>(null)

  useEffect(() => {
    const hot = hotRef.current?.hotInstance
    if (hot) {
      hot.loadData(data as never[][])
    }
  }, [data])

  return (
    <HotTable
      ref={hotRef}
      data={data as never[][]}
      columns={columns as never[]}
      colHeaders={columns.map((c) => c.title)}
      rowHeaders={true}
      readOnly={readOnly}
      licenseKey="non-commercial-and-evaluation"
      height="100%"
      width="100%"
      stretchH="all"
      afterChange={(changes) => {
        if (!changes) return
        for (const [row, col, , newVal] of changes) {
          const colIndex = typeof col === 'number' ? col : Number(col)
          const columnKey = columnKeys[colIndex]
          if (columnKey) {
            syncEngine.applySpreadsheetChange(tabKey, row, columnKey, newVal)
          }
        }
      }}
    />
  )
}
