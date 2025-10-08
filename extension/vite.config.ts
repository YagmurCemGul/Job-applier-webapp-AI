/**
 * Vite configuration for browser extension
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy manifest and public files to dist
        mkdirSync('dist-extension/public/icons', { recursive: true });
        copyFileSync('manifest.json', 'dist-extension/manifest.json');
      },
    },
  ],
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Background service worker
        'background/service': resolve(__dirname, 'background/service.ts'),

        // Content scripts
        'content/greenhouse': resolve(__dirname, 'content/greenhouse.ts'),
        'content/lever': resolve(__dirname, 'content/lever.ts'),
        'content/workday': resolve(__dirname, 'content/workday.ts'),
        'content/indeed': resolve(__dirname, 'content/indeed.ts'),
        'content/linkedin': resolve(__dirname, 'content/linkedin.ts'),
        'content/generic': resolve(__dirname, 'content/generic.ts'),

        // UI pages
        'ui/popup': resolve(__dirname, 'ui/popup.tsx'),
        'ui/options': resolve(__dirname, 'ui/options.tsx'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep directory structure
          return `${chunkInfo.name}.js`;
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
