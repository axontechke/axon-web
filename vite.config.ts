import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    watch: {
      ignored: ['**/AXON TECH WEB PRICE LIST(AUGUST 2026).csv']
    },
      // Proxy API calls to Cloudflare Worker for development
      // For local D1: `wrangler dev` runs on :8787 (local). For remote, set VITE_WORKER_URL or use remote.
      proxy: {
        '/api': {
          target: process.env.WORKER_URL || 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
  };
});
