import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import RadixVueResolver from 'radix-vue/resolver'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        //vueDevTools(),
        Components({
            dts: true,
            resolvers: [RadixVueResolver()],
        }),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.ico', 'icons/*.png', 'icons/*.svg'],
            manifest: {
                name: 'Todo',
                short_name: 'Todo',
                description: 'Todo — задачи и достижения',
                theme_color: '#41b883',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait-primary',
                scope: '/',
                start_url: '/',
                id: '/',
                categories: ['productivity'],
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/icons/icon-maskable-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                    {
                        src: '/icons/icon-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                screenshots: [],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
                            networkTimeoutSeconds: 10,
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: { maxEntries: 128, maxAgeSeconds: 30 * 24 * 60 * 60 },
                        },
                    },
                ],
                cleanupOutdatedCaches: true,
                skipWaiting: false,
                clientsClaim: true,
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
})
