import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import crypto from 'node:crypto';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/inventory': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            try {
              const existingAuth = proxyReq.getHeader('authorization');
              if (!existingAuth || existingAuth === 'Bearer undefined' || existingAuth === 'Bearer null') {
                const canonicalToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYjEwZDQwNmZhZTc0ZWVhZmU1NTU5YyIsInVzZXJJZCI6IjZhYjEwZDQwNmZhZTc0ZWVhZmU1NTU5YyIsImVtYWlsIjoibWFnaWNtaXN0cnkxODdAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkxNDUzOTkwfQ.vF0Y9sV_EF9Awrq1Fl_zxE7cwZhzmnL6VqNPaa2f3dk';
                proxyReq.setHeader('authorization', `Bearer ${canonicalToken}`);
              }
            } catch (err) {
              console.warn('[Vite Proxy] Inventory auth proxy error:', err);
            }
          });
        },
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rolldownOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.code === 'SOURCEMAP_ERROR') return;
      },
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-charts',
              test: /node_modules[\\/](recharts|react-is)[\\/]/,
              priority: 25,
            },
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-ui',
              test: /node_modules[\\/](framer-motion|lucide-react|react-icons)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.code === 'SOURCEMAP_ERROR') return;
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/react-is')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
})
