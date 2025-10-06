import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Background service worker
        service: resolve(__dirname, 'background/service.ts'),
        // Content scripts
        greenhouse: resolve(__dirname, 'content/greenhouse.ts'),
        lever: resolve(__dirname, 'content/lever.ts'),
        workday: resolve(__dirname, 'content/workday.ts'),
        indeed: resolve(__dirname, 'content/indeed.ts'),
        linkedin: resolve(__dirname, 'content/linkedin.ts'),
        generic: resolve(__dirname, 'content/generic.ts'),
        // UI
        popup: resolve(__dirname, 'ui/popup.tsx'),
        options: resolve(__dirname, 'ui/options.tsx')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service') {
            return 'background/[name].js'
          }
          if (['greenhouse', 'lever', 'workday', 'indeed', 'linkedin', 'generic'].includes(chunkInfo.name)) {
            return 'content/[name].js'
          }
          return 'ui/[name].js'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.')
    }
  }
})
