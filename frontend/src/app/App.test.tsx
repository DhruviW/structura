import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders mode bar with Select button', () => {
    render(<App />)
    expect(screen.getByText('Select (V)')).toBeInTheDocument()
  })

  it('renders Run Analysis button', () => {
    render(<App />)
    expect(screen.getByText('Run Analysis')).toBeInTheDocument()
  })

  it('renders spreadsheet placeholder in bottom panel', () => {
    render(<App />)
    expect(screen.getByText('Spreadsheet (placeholder)')).toBeInTheDocument()
  })
})
