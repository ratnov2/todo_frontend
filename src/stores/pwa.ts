import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePwaStore = defineStore('pwa', () => {
    const needRefresh = ref(false)
    let updateSw: ((reload?: boolean) => void) | null = null

    function setNeedRefresh(value: boolean) {
        needRefresh.value = value
    }

    function setUpdateSw(fn: (reload?: boolean) => void) {
        updateSw = fn
    }

    function applyUpdate() {
        if (updateSw) {
            updateSw(true)
            needRefresh.value = false
        }
    }

    return { needRefresh, setNeedRefresh, setUpdateSw, applyUpdate }
})
