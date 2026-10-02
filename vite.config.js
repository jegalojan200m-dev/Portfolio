import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not ie 11'],
    }),
  ],
  server: {
    host: 'localhost',
    port: 3000,
    open: true,
    proxy: {
      '/php': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
