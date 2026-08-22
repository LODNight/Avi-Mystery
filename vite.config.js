import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const includeSpikeHarness = process.env.BUILD_SQL_SPIKE === 'true'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: includeSpikeHarness
        ? {
            main: path.resolve(__dirname, './index.html'),
            'sql-engine-spike': path.resolve(
              __dirname,
              './src/utils/sql/sql-spike.html'
            ),
          }
        : {
            main: path.resolve(__dirname, './index.html'),
          },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, './src/test/setup.js'),
  },
})
