import '@testing-library/jest-dom'

// Mock ResizeObserver which is not available in jsdom
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
