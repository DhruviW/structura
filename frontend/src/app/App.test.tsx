import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders mode bar placeholder', () => {
    render(<App />)
    expect(screen.getByText('Mode Bar (placeholder)')).toBeInTheDocument()
  })

  it('renders canvas area placeholder', () => {
    render(<App />)
    expect(screen.getByText('SVG Canvas (placeholder)')).toBeInTheDocument()
  })

  it('renders spreadsheet area placeholder', () => {
    render(<App />)
    expect(screen.getByText('Spreadsheet (placeholder)')).toBeInTheDocument()
  })
})
