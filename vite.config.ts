import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// O plus_ms_estoque não envia headers de CORS, então o browser bloqueia fetch direto
// entre origens diferentes (:4002 -> :3000/3002). O proxy abaixo roda no processo
// Node do Vite (dev ou preview/Docker), não no browser, então não sofre CORS.
// MS_ESTOQUE_PROXY_TARGET é lido em runtime (process.env), util pra apontar pro
// host (host.docker.internal) ou pro nome do servico no docker-compose, sem rebuild.
const MS_ESTOQUE_PROXY_TARGET = process.env.MS_ESTOQUE_PROXY_TARGET || 'http://localhost:3000';

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
    proxy: {
      '/estoque': MS_ESTOQUE_PROXY_TARGET,
      '/health': MS_ESTOQUE_PROXY_TARGET,
    },
  },
  preview: {
    port: 4002,
    host: true,
    proxy: {
      '/estoque': MS_ESTOQUE_PROXY_TARGET,
      '/health': MS_ESTOQUE_PROXY_TARGET,
    },
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
