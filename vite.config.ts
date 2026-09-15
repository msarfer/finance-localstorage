import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type ESBuildOptions } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/finance-localstorage/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  esbuild:
    mode === 'production'
      ? ({ drop: ['console', 'debugger'] } as unknown as ESBuildOptions)
      : undefined,
  build: {
    reportCompressedSize: false,
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      pwaAssets: {
        config: true,
      },
      manifest: {
        name: 'Mis Finanzas',
        short_name: 'Mis Finanzas',
        description:
          'Controla tus ingresos y gastos en euros: cuentas online y efectivo físico, movimientos y categorías.',
        theme_color: '#0f6b5a',
        background_color: '#f7f5ef',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        lang: 'es',
        categories: ['finance', 'productivity'],
        start_url: '.',
        scope: '.',
        id: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/finance-localstorage/index.html',
        navigateFallbackDenylist: [
          /^\/finance-localstorage\/assets\//,
          /\.(?:png|ico|svg|woff2|webmanifest|xml)$/,
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))