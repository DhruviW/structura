import { ModeBar } from './ModeBar'
import { CanvasRoot } from '../canvas/CanvasRoot'
import { PropertiesPanel } from '../panels/PropertiesPanel'
import { LayersPanel } from '../panels/LayersPanel'
import { MaterialLibrary } from '../panels/MaterialLibrary'
import { SpreadsheetPanel } from '../spreadsheet/SpreadsheetPanel'

export function Layout() {
  return (
    <div className="layout">
      <ModeBar />
      <div className="workspace">
        <div className="canvas-container">
          <div className="canvas-root">
            <CanvasRoot />
          </div>
        </div>
        <div className="sidebar">
          <PropertiesPanel />
          <LayersPanel />
          <MaterialLibrary />
        </div>
      </div>
      <div className="bottom-panel">
        <SpreadsheetPanel />
      </div>
    </div>
  )
}
