import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const base = process.env.PAGES_BASE_PATH || '/tft/';
export default defineConfig({
  base,
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  define: { __PAGES_BASE__: JSON.stringify(base) },
  build: { outDir: 'dist-pages', emptyOutDir: true },
});
