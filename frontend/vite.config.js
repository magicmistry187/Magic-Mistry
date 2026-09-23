import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
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
