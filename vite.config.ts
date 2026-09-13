import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path is injected at build time by the GitHub Actions workflow.
// Locally it falls back to '/' so `npm run dev` works without config.
export default defineConfig(() => ({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          motion: ['framer-motion'],
        },
      },
    },
  },
}))
