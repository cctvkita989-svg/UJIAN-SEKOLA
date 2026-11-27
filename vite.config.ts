import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function safeDisabledHmrPlugin(): Plugin {
  return {
    name: 'safe-disabled-hmr-client',
    apply: 'serve',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('vite/dist/client/client.mjs')) {
        let patched = code.replace(
          'ws.send(JSON.stringify(data));',
          'if (ws?.readyState === 1) ws.send(JSON.stringify(data));'
        );
        if (process.env.DISABLE_HMR === 'true') {
          patched = patched.replace(
            'transport.connect(createHMRHandler(handleMessage));',
            '/* WebSocket HMR connection skipped when DISABLE_HMR=true */'
          );
        }
        return patched;
      }

      if (id.includes('pwa-entry-point-loaded') && code.includes('import.meta.hot.send(')) {
        if (process.env.DISABLE_HMR === 'true') {
          return code.replace(
            /import\.meta\.hot\.send\(([^)]+)\);/g,
            'void 0;'
          );
        }
        return code.replace(
          /import\.meta\.hot\.send\(([^)]+)\);/g,
          'Promise.resolve(import.meta.hot?.send($1)).catch(() => {});'
        );
      }

      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      safeDisabledHmrPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.json',
        includeAssets: [
          'icon-192.svg',
          'icon-512.svg',
          'icon-maskable-512.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'CBT SMP NEGERI 1 PANDAN',
          short_name: 'CBT SMPN 1',
          description:
            'Sistem Ujian Sekolah Computer Based Test (CBT) Terintegrasi untuk Siswa dan Guru SMP Negeri 1 Pandan',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['education', 'productivity'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          globIgnores: ['**/dist.zip', '**/*.zip'],
          navigateFallbackDenylist: [/\.zip(\?.*)?$/i, /^\/\.well-known\//],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
