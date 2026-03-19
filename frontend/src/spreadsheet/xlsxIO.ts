import * as XLSX from 'xlsx'
import { syncEngine } from '../sync/syncEngine'
import { useModelStore } from '../store/modelStore'
import type { StructuralNode, Member, Plate, Material, Section, Load } from '../types/model'

// Sheet names in export order
const SHEET_NAMES = ['Nodes', 'Members', 'Plates', 'Materials', 'Sections', 'Loads', 'Results'] as const
type SheetName = (typeof SHEET_NAMES)[number]

// Required sheets for a valid import (Results is optional)
const REQUIRED_SHEET_NAMES: SheetName[] = ['Nodes', 'Members', 'Plates', 'Materials', 'Sections', 'Loads']

// Column headers per sheet (matches getTabData output order)
const HEADERS: Record<string, string[]> = {
  Nodes: ['ID', 'X', 'Y', 'Support', 'Ux', 'Uy', 'Rz'],
  Members: ['ID', 'Start Node', 'End Node', 'Section', 'Material'],
  Plates: ['ID', 'Node 1', 'Node 2', 'Node 3', 'Node 4', 'Thickness', 'Material', 'Type'],
  Materials: ['ID', 'Name', 'E (Pa)', 'G (Pa)', 'ν', 'ρ (kg/m³)', 'fy (Pa)'],
  Sections: ['ID', 'Name', 'A', 'Iz', 'Iy', 'J', 'Sz', 'Sy'],
  Loads: ['ID', 'Type', 'Target', 'Fx/wx', 'Fy/wy', 'Mz', 'Pattern'],
  Results: ['Type', 'ID/Node', 'Value 1', 'Value 2', 'Value 3'],
}

export function exportToXlsx(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()

  const tabKeys = ['nodes', 'members', 'plates', 'materials', 'sections', 'loads']

  for (let i = 0; i < tabKeys.length; i++) {
    const tabKey = tabKeys[i]
    const sheetName = SHEET_NAMES[i]
    const headers = HEADERS[sheetName]
    const rows = syncEngine.getTabData(tabKey)
    const aoa = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  // Results sheet — empty by default if no results available
  const resultsAoa = [HEADERS['Results']]
  const resultsWs = XLSX.utils.aoa_to_sheet(resultsAoa)
  XLSX.utils.book_append_sheet(wb, resultsWs, 'Results')

  return wb
}

export function downloadXlsx(filename = 'structural-model.xlsx'): void {
  const wb = exportToXlsx()
  XLSX.writeFile(wb, filename)
}

export function validateXlsxImport(wb: XLSX.WorkBook): { valid: boolean; message?: string } {
  for (const required of REQUIRED_SHEET_NAMES) {
    if (!wb.SheetNames.includes(required)) {
      return { valid: false, message: `Missing required sheet: "${required}"` }
    }
  }
  return { valid: true }
}

export function importFromXlsx(wb: XLSX.WorkBook): void {
  const validation = validateXlsxImport(wb)
  if (!validation.valid) {
    throw new Error(validation.message)
  }

  const store = useModelStore.getState()
  store.reset()

  // Parse Nodes
  const nodesSheet = wb.Sheets['Nodes']
  if (nodesSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(nodesSheet)
    for (const row of rows) {
      const node: StructuralNode = {
        id: Number(row['ID']),
        x: Number(row['X']),
        y: Number(row['Y']),
        restraints: [Number(row['Ux']) as 0 | 1, Number(row['Uy']) as 0 | 1, Number(row['Rz']) as 0 | 1],
      }
      store.addNode(node)
    }
  }

  // Parse Members
  const membersSheet = wb.Sheets['Members']
  if (membersSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(membersSheet)
    for (const row of rows) {
      const member: Member = {
        id: Number(row['ID']),
        i: Number(row['Start Node']),
        j: Number(row['End Node']),
        section: String(row['Section'] ?? ''),
        material: String(row['Material'] ?? ''),
      }
      store.addMember(member)
    }
  }

  // Parse Plates
  const platesSheet = wb.Sheets['Plates']
  if (platesSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(platesSheet)
    for (const row of rows) {
      const plate: Plate = {
        id: Number(row['ID']),
        nodes: [
          Number(row['Node 1']),
          Number(row['Node 2']),
          Number(row['Node 3']),
          Number(row['Node 4']),
        ],
        thickness: Number(row['Thickness']),
        material: String(row['Material'] ?? ''),
        type: (row['Type'] === 'membrane' ? 'membrane' : 'shell') as 'shell' | 'membrane',
      }
      store.addPlate(plate)
    }
  }

  // Parse Materials
  const materialsSheet = wb.Sheets['Materials']
  if (materialsSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(materialsSheet)
    for (const row of rows) {
      const material: Material = {
        id: String(row['ID']),
        name: String(row['Name'] ?? ''),
        E: Number(row['E (Pa)']),
        G: Number(row['G (Pa)']),
        nu: Number(row['ν']),
        rho: Number(row['ρ (kg/m³)']),
        fy: Number(row['fy (Pa)']),
      }
      store.addMaterial(material)
    }
  }

  // Parse Sections
  const sectionsSheet = wb.Sheets['Sections']
  if (sectionsSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sectionsSheet)
    for (const row of rows) {
      const section: Section = {
        id: String(row['ID']),
        name: String(row['Name'] ?? ''),
        A: Number(row['A']),
        Iz: Number(row['Iz']),
        Iy: Number(row['Iy']),
        J: Number(row['J']),
        Sz: Number(row['Sz']),
        Sy: Number(row['Sy']),
      }
      store.addSection(section)
    }
  }

  // Parse Loads
  const loadsSheet = wb.Sheets['Loads']
  if (loadsSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(loadsSheet)
    for (const row of rows) {
      const loadType = String(row['Type'])
      let load: Load
      if (loadType === 'distributed') {
        load = {
          type: 'distributed',
          member: Number(row['Target']),
          wx: Number(row['Fx/wx'] ?? 0),
          wy: Number(row['Fy/wy'] ?? 0),
        }
      } else if (loadType === 'moment') {
        load = {
          type: 'moment',
          node: Number(row['Target']),
          Mz: Number(row['Mz'] ?? 0),
        }
      } else {
        load = {
          type: 'point',
          node: Number(row['Target']),
          Fx: Number(row['Fx/wx'] ?? 0),
          Fy: Number(row['Fy/wy'] ?? 0),
          Mz: Number(row['Mz'] ?? 0),
        }
      }
      store.addLoad(load)
    }
  }
}
