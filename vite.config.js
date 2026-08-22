import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    // Step 4.0: keep the SQL engine in the production graph while product UI/route
    // remains intentionally out of scope. Remove this extra entry once a later
    // SQL runtime entry imports the adapter.
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, './index.html'),
        'sql-engine-spike': path.resolve(
          __dirname,
          './src/utils/sql/sql-spike.html'
        ),
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
