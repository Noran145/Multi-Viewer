import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Multi-Viewer/',
  plugins: [
    react(),
VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        navigateFallback: '/Multi-Viewer/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'ymv.png'],
      manifest: {
        name: 'Multi-Viewer',
        short_name: 'MV',
        description: '動画やライブ配信を最大4窓で同時視聴できるPWAアプリ',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/Multi-Viewer/',
        start_url: '/Multi-Viewer/',
        categories: ['entertainment', 'multimedia'],
        icons: [
          {
            src: 'ymv.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'ymv.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
