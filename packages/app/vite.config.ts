import type { PluginOption } from 'vite';

import { defineConfig } from 'vite';

import wasmPlugin from 'vite-plugin-wasm';

export default defineConfig({
  build: {
    target: 'esnext',
  },
  plugins: [wasmPlugin()],
  worker: {
    format: 'es',
    plugins: () => [wasmPlugin() as PluginOption],
  },
});
