import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror tsconfig's "@/*" -> "src/*" so tests can import app code.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Tests run in Node; the 'server-only' guard is a browser-bundle
      // concern, so stub it out.
      'server-only': fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
  },
});
