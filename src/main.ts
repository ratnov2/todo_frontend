import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// @ts-expect-error - ignore type error
import { registerSW } from 'virtual:pwa-register'
import { ElMessage } from 'element-plus'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { usePwaStore } from './stores/pwa'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const pwaStore = usePwaStore()
const updateSW = registerSW({
    onNeedRefresh() {
        pwaStore.setNeedRefresh(true)
    },
    onOfflineReady() {
        ElMessage({ message: 'Приложение готово к работе офлайн', type: 'success' })
    },
    onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration) {
        console.log(swUrl, registration)

        const oneHour = 60 * 60 * 1000
        if (registration) {
            setInterval(async () => {
                if (registration.installing || !navigator) return
                if ('connection' in navigator && !navigator.onLine) return
                const resp = await fetch(swUrl, {
                    cache: 'no-store',
                    headers: { cache: 'no-store', 'cache-control': 'no-cache' },
                })
                if (resp?.status === 200) await registration.update()
            }, oneHour)
        }
    },
})
pwaStore.setUpdateSw(updateSW)

app.use(router)
app.use(ElementPlus)
app.use(VueQueryPlugin)

app.mount('#app')
