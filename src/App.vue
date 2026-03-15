<script setup lang="ts">
import { RouterView } from 'vue-router'
import { usePwaStore } from '@/stores/pwa'

const pwaStore = usePwaStore()
</script>

<template>
    <div class="app">
        <div v-if="pwaStore.needRefresh" class="pwa-update-banner">
            <span>Доступна новая версия</span>
            <button type="button" class="pwa-update-btn" @click="pwaStore.applyUpdate()">
                Обновить
            </button>
        </div>
        <RouterView />
    </div>
</template>

<style scoped>
.app {
    min-height: 100vh;
}

.pwa-update-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--el-color-primary);
    color: #fff;
    font-size: 14px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.pwa-update-btn {
    padding: 6px 16px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 6px;
    background: transparent;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}

.pwa-update-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}
</style>

<style scoped></style>
