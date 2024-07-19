import { defineConfig } from 'vite';

import wasmPlugin from 'vite-plugin-wasm';

export default defineConfig({
  build: {
    target: 'esnext',
  },
  plugins: [wasmPlugin()],
});
