import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import RadixVueResolver from 'radix-vue/resolver'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        //vueDevTools(),
        Components({
            dts: true,
            resolvers: [
                RadixVueResolver(),

                // RadixVueResolver({
                //   prefix: '' // use the prefix option to add Prefix to the imported components
                // })
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
