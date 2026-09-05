import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Tailwind runs as a Vite plugin (Tailwind v4), so there is no
// tailwind.config.js or postcss.config.js to maintain. Theme tokens
// live in src/index.css under @theme.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
});
