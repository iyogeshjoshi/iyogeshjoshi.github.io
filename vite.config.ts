import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      port: 3000,
      open: true,
    },
    preview: {
      port: 4173,
    },
    define: {
      'import.meta.env.VITE_GITHUB_TOKEN': JSON.stringify(
        env.VITE_GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || ''
      ),
    },
  };
});
