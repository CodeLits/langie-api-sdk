import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname),
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      'langie-api-sdk': resolve(__dirname, '../../src')
    }
  },
  server: {
    port: 5175,
    fs: {
      // Allow serving files from the project root
      allow: ['../..']
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
