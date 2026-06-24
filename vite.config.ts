import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4002,
    host: true,
  },
  preview: {
    port: 4002,
    host: true,
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:4002' },
    },
    setupFiles: ['./src/setupTests.ts'],
  },
});
