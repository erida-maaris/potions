import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  preview: {
    host: true,
    port: 5173,
  },
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')
      ],
    },
  },
});
