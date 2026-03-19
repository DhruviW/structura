import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NodeElement } from '../../../src/canvas/elements/NodeElement'

describe('NodeElement', () => {
  it('renders a circle at screen position', () => {
    const { container } = render(
      <svg>
        <NodeElement screenX={100} screenY={200} id={1} selected={false} />
      </svg>
    )
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBeGreaterThanOrEqual(1)
    const mainCircle = circles[0]
    expect(mainCircle.getAttribute('cx')).toBe('100')
    expect(mainCircle.getAttribute('cy')).toBe('200')
  })

  it('shows selection highlight when selected', () => {
    const { container } = render(
      <svg>
        <NodeElement screenX={50} screenY={75} id={2} selected={true} />
      </svg>
    )
    const circles = container.querySelectorAll('circle')
    // When selected, there should be at least 2 circles (main + highlight ring)
    expect(circles.length).toBeGreaterThanOrEqual(2)
  })

  it('does not show selection highlight when not selected', () => {
    const { container } = render(
      <svg>
        <NodeElement screenX={50} screenY={75} id={3} selected={false} />
      </svg>
    )
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(1)
  })

  it('renders a text label with the node id', () => {
    const { container } = render(
      <svg>
        <NodeElement screenX={100} screenY={200} id={42} selected={false} />
      </svg>
    )
    const text = container.querySelector('text')
    expect(text).not.toBeNull()
    expect(text!.textContent).toContain('42')
  })

  it('calls onClick when clicked', () => {
    let clicked = false
    const { container } = render(
      <svg>
        <NodeElement
          screenX={100}
          screenY={200}
          id={1}
          selected={false}
          onClick={() => { clicked = true }}
        />
      </svg>
    )
    const group = container.querySelector('g')
    group?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(clicked).toBe(true)
  })
})
