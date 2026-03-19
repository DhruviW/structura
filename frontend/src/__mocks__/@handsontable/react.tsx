// Mock for @handsontable/react in jsdom test environment
import { forwardRef } from 'react'

export const HotTable = forwardRef<unknown, Record<string, unknown>>((_props, _ref) => {
  return <div data-testid="handsontable-mock" />
})

HotTable.displayName = 'HotTable'
