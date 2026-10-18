import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// When deploying to GitHub Pages we need the sub-path base.
// Set GITHUB_PAGES=true in the build environment to activate it.
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGitHubPages ? '/Vaccine-recommder/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Same-origin API calls in development, so session cookies just work.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
