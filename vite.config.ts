import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-toast', '@radix-ui/react-slot'],
          'vendor-styling': ['tailwindcss', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          'vendor-other': ['sonner', 'next-themes'],
        },
      },
    },
  },
});
