import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Bookmarks/' : '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/images/favicon.png', 'assets/images/icon-192.png', 'assets/images/icon-512.png'],
      manifest: {
        name: 'BOOKMARKS',
        short_name: 'BOOKMARKS',
        description: 'Track the pages, Keep the memories, Quantify your curiosity',
        start_url: '/Bookmarks/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#ffbd59',
        orientation: 'any',
        scope: '/Bookmarks/',
        icons: [
          {
            src: 'assets/images/favicon.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'assets/images/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,json}']
      },
      devOptions: {
        enabled: false
      }
    })
  ]
}))
