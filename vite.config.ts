import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Root path since this is the user/organization site
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}); 