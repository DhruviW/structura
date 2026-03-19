import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    alias: [
      // Mock Handsontable CSS to avoid jsdom resolution errors
      {
        find: 'handsontable/dist/handsontable.full.min.css',
        replacement: '/Users/dhruviwadhwana/Desktop/Claude project/structural-analysis-tool/frontend/src/__mocks__/empty.css',
      },
      // Mock the entire handsontable and @handsontable/react packages in tests
      {
        find: 'handsontable/registry',
        replacement: '/Users/dhruviwadhwana/Desktop/Claude project/structural-analysis-tool/frontend/src/__mocks__/handsontable.ts',
      },
      {
        find: /^handsontable$/,
        replacement: '/Users/dhruviwadhwana/Desktop/Claude project/structural-analysis-tool/frontend/src/__mocks__/handsontable.ts',
      },
      {
        find: '@handsontable/react',
        replacement: '/Users/dhruviwadhwana/Desktop/Claude project/structural-analysis-tool/frontend/src/__mocks__/@handsontable/react.tsx',
      },
    ],
  },
})
