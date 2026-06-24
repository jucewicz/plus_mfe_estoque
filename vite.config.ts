import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfe_estoque',
      filename: 'remoteEntry.js',
      exposes: {
        './EstoqueDashboardPage': './src/pages/EstoqueDashboardPage.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
  },
  server: {
    port: 4002,
    host: true,
    // Proxy só para dev local: o plus_ms_estoque não envia headers de CORS,
    // então o browser bloqueia fetch direto de :4002 para :3000.
    proxy: {
      '/estoque': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
  preview: {
    port: 4002,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:4002' },
    },
    setupFiles: ['./src/setupTests.ts'],
  },
});
