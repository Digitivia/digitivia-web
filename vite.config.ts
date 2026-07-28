import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Project Pages serve from /<repo>/, so assets need that prefix in CI builds.
// Pointing a custom domain at it later just means setting this back to '/'.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/digitivia-web/' : '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5273, host: true },
})
