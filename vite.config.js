import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:3002'
  const outDir = env.VITE_BUILD_OUTDIR || 'dist'
  const base   = env.VITE_BUILD_BASE   || '/'
  const input  = env.VITE_BUILD_INPUT  || undefined

  return {
    base,
    plugins: [react()],
    build: {
      outDir,
      ...(input ? { rollupOptions: { input } } : {}),
    },
    server: {
      port: 3011,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
