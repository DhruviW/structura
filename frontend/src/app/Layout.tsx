import { ModeBar } from './ModeBar'
import { StatusBar } from './StatusBar'
import { CanvasRoot } from '../canvas/CanvasRoot'
import { PropertiesPanel } from '../panels/PropertiesPanel'
import { LayersPanel } from '../panels/LayersPanel'
import { MaterialLibrary } from '../panels/MaterialLibrary'
import { ResultsPanel } from '../panels/ResultsPanel'
import { SpreadsheetPanel } from '../spreadsheet/SpreadsheetPanel'

interface LayoutProps {
  projectId?: string | null
  onBack?: () => void
}

export function Layout({ projectId: _projectId, onBack }: LayoutProps = {}) {
  return (
    <div className="layout">
      <ModeBar onBack={onBack} />
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
          <ResultsPanel />
        </div>
      </div>
      <StatusBar />
      <div className="bottom-panel">
        <SpreadsheetPanel />
      </div>
    </div>
  )
}
