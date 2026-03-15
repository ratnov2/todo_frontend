<script setup lang="ts">
import TodayTasksList from '@/components/TodayTasksList.vue'
</script>

<template>
    <div :class="$style.dashboard">
        <div :class="$style.content">
            <main :class="$style.main">
                <TodayTasksList date-filter="today" />
            </main>
        </div>
    </div>
</template>

<style module>
.dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
    color: #f5f5f5;
    display: flex;
    flex-direction: column;
    position: relative;
}

.dashboard::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
}

.content {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.main {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    scroll-behavior: smooth;
}

@media (max-width: 768px) {
    .main {
        padding: 0 0 88px;
    }
}

.main::-webkit-scrollbar {
    width: 8px;
}

.main::-webkit-scrollbar-track {
    background: #0f0f0f;
}

.main::-webkit-scrollbar-thumb {
    background: #2a2a2a;
    border-radius: 4px;
}

.main::-webkit-scrollbar-thumb:hover {
    background: #3a3a3a;
}
</style>
