import { useState } from 'react'
import { useModelStore } from '../store/modelStore'
import { useResultsStore } from '../store/resultsStore'
import { syncEngine } from '../sync/syncEngine'
import { SheetTab } from './SheetTab'
import { nodesColumns, nodesColumnKeys } from './tabConfigs/nodesConfig'
import { membersColumns, membersColumnKeys } from './tabConfigs/membersConfig'
import { platesColumns, platesColumnKeys } from './tabConfigs/platesConfig'
import { materialsColumns, materialsColumnKeys } from './tabConfigs/materialsConfig'
import { sectionsColumns, sectionsColumnKeys } from './tabConfigs/sectionsConfig'
import { loadsColumns, loadsColumnKeys } from './tabConfigs/loadsConfig'
import { resultsColumns, resultsColumnKeys } from './tabConfigs/resultsConfig'

type TabKey = 'nodes' | 'members' | 'plates' | 'materials' | 'sections' | 'loads' | 'results'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'nodes', label: 'Nodes' },
  { key: 'members', label: 'Members' },
  { key: 'plates', label: 'Plates' },
  { key: 'materials', label: 'Materials' },
  { key: 'sections', label: 'Sections' },
  { key: 'loads', label: 'Loads' },
  { key: 'results', label: 'Results' },
]

function buildResultsData(results: ReturnType<typeof useResultsStore.getState>['results']): unknown[][] {
  if (!results) return []
  const rows: unknown[][] = []

  for (const d of results.displacements) {
    rows.push(['displacement', d.node, d.ux, d.uy, d.rz])
  }
  for (const f of results.member_forces) {
    rows.push(['member-N', f.id, f.N[0], f.N[1], null])
    rows.push(['member-V', f.id, f.V[0], f.V[1], null])
    rows.push(['member-M', f.id, f.M[0], f.M[1], null])
  }
  for (const r of results.reactions) {
    rows.push(['reaction', r.node, r.Fx, r.Fy, r.Mz])
  }

  return rows
}

export function SpreadsheetPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('nodes')

  // Subscribe to store counts to trigger re-renders on data change
  // (reading lengths avoids returning a new array reference on every render)
  useModelStore((s) => s.nodes.length)
  useModelStore((s) => s.members.length)
  useModelStore((s) => s.plates.length)
  useModelStore((s) => s.materials.length)
  useModelStore((s) => s.sections.length)
  useModelStore((s) => s.loads.length)
  const results = useResultsStore((s) => s.results)

  const tabData: Record<TabKey, unknown[][]> = {
    nodes: syncEngine.getTabData('nodes'),
    members: syncEngine.getTabData('members'),
    plates: syncEngine.getTabData('plates'),
    materials: syncEngine.getTabData('materials'),
    sections: syncEngine.getTabData('sections'),
    loads: syncEngine.getTabData('loads'),
    results: buildResultsData(results),
  }

  const tabConfigs: Record<TabKey, { columns: object[]; columnKeys: string[]; readOnly: boolean }> = {
    nodes: { columns: nodesColumns, columnKeys: nodesColumnKeys, readOnly: false },
    members: { columns: membersColumns, columnKeys: membersColumnKeys, readOnly: false },
    plates: { columns: platesColumns, columnKeys: platesColumnKeys, readOnly: false },
    materials: { columns: materialsColumns, columnKeys: materialsColumnKeys, readOnly: false },
    sections: { columns: sectionsColumns, columnKeys: sectionsColumnKeys, readOnly: false },
    loads: { columns: loadsColumns, columnKeys: loadsColumnKeys, readOnly: false },
    results: { columns: resultsColumns, columnKeys: resultsColumnKeys, readOnly: true },
  }

  const cfg = tabConfigs[activeTab]

  return (
    <div className="spreadsheet-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab navigation — Excel-style sheet tabs */}
      <div
        className="sheet-tabs"
        style={{
          display: 'flex',
          borderBottom: '1px solid #ccc',
          background: '#f0f0f0',
          paddingTop: '4px',
          paddingLeft: '4px',
          gap: '2px',
        }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '4px 12px',
              border: '1px solid #ccc',
              borderBottom: activeTab === key ? 'none' : '1px solid #ccc',
              background: activeTab === key ? '#ffffff' : '#e0e0e0',
              cursor: 'pointer',
              fontWeight: activeTab === key ? 'bold' : 'normal',
              borderRadius: '3px 3px 0 0',
              marginBottom: activeTab === key ? '-1px' : '0',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sheet content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SheetTab
          key={activeTab}
          tabKey={activeTab}
          columns={cfg.columns as never[]}
          columnKeys={cfg.columnKeys}
          data={tabData[activeTab]}
          readOnly={cfg.readOnly}
        />
      </div>
    </div>
  )
}
