// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    watch: {
      usePolling: false, // ✅ réduit CPU sur Windows
    },
    hmr: {
      overlay: false, // ✅ léger gain
    },
    fs: {
      strict: true, // ✅ évite scans inutiles
    },
  },

  build: {
    sourcemap: false, // ✅ build plus rapide
  },

  esbuild: {
    drop: ['console', 'debugger'], // ✅ allège le code
  },

  optimizeDeps: {
    include: ['react', 'react-dom'], // ⚠️ optionnel
  },
})