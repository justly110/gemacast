import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

const host = process.env.TAURI_DEV_HOST;
const port = process.env.PORT;

export default defineConfig({
  plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
  clearScreen: false,
  build: {
    target: 'esnext',
    // Vite 8 minifies with oxc, whose option surface has no equivalent of
    // esbuild's `drop`, so the old `esbuild: { drop: [...] }` block had quietly
    // become a no-op and production bundles shipped every console call. Terser
    // exposes the flag directly.
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: port ? parseInt(port) : 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
});
