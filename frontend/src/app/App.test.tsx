import { render, screen } from '@testing-library/react'
import { Layout } from './Layout'

// App now wraps Layout with AuthGuard + ProjectListPage routing.
// We test Layout directly here to avoid needing a project selection flow.
describe('Layout', () => {
  it('renders mode bar with Select button', () => {
    render(<Layout />)
    expect(screen.getByText('Select (V)')).toBeInTheDocument()
  })

  it('renders Run Analysis button', () => {
    render(<Layout />)
    expect(screen.getByText('Run Analysis')).toBeInTheDocument()
  })

  it('renders spreadsheet panel in bottom panel', () => {
    render(<Layout />)
    // SpreadsheetPanel renders tab buttons; "Nodes" tab should be present
    expect(screen.getByText('Nodes')).toBeInTheDocument()
  })
})
