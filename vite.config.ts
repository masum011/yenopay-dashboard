import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@yenopay/shared-ui': path.resolve(__dirname, 'packages/shared-ui/src'),
        '@yenopay/shared-utils': path.resolve(__dirname, 'packages/shared-utils/src'),
        '@super-admin': path.resolve(__dirname, 'apps/super-admin/src'),
        '@retailer': path.resolve(__dirname, 'apps/retailer/src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
