import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: { maximumFileSizeToCacheInBytes: 5000000 },
        devOptions: {
          enabled: false,
        },
        manifest: {
          name: 'Portal Pejuang Al-Bahjah',
          short_name: 'Al-Bahjah',
          description: 'Aplikasi Absensi dan Portal Pejuang Al-Bahjah',
          theme_color: '#10b981',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: 'https://lh3.googleusercontent.com/d/1ZIWK0eZvvfie7s1E5xEJ4YeVUX_NUWUp',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://lh3.googleusercontent.com/d/1ZIWK0eZvvfie7s1E5xEJ4YeVUX_NUWUp',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
