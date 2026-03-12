<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    IconHome,
    IconCalendar,
    IconLayoutDashboard,
    IconTrophy,
    IconUser,
    IconPlus,
} from '@tabler/icons-vue'

const route = useRoute()
const router = useRouter()

type Tab = {
    key: string
    title: string
    to: { name: string }
    icon: Component
    isActive: () => boolean
}

const tabs = computed<Tab[]>(() => [
    {
        key: 'home',
        title: 'Home',
        to: { name: 'home' },
        icon: IconHome,
        isActive: () => route.name === 'home',
    },
    {
        key: 'today',
        title: 'Today',
        to: { name: 'today' },
        icon: IconCalendar,
        isActive: () => route.name === 'today',
    },
    {
        key: 'dashboard',
        title: 'Dashboard',
        to: { name: 'dashboard' },
        icon: IconLayoutDashboard,
        isActive: () => route.name === 'dashboard',
    },
    {
        key: 'achievements',
        title: 'Awards',
        to: { name: 'achievements' },
        icon: IconTrophy,
        isActive: () => route.name === 'achievements',
    },
    {
        key: 'profile',
        title: 'Profile',
        to: { name: 'profile' },
        icon: IconUser,
        isActive: () => route.name === 'profile',
    },
])

// const tabsLeft = computed<Tab[]>(() => tabs.value.slice(0, 2))
// const tabsRight = computed<Tab[]>(() => tabs.value.slice(2))

function go(tab: Tab) {
    router.push(tab.to)
}

function createTask() {
    router.push({ name: 'creatingTask' })
}
</script>

<template>
    <nav class="tabbar" aria-label="Bottom navigation">
        <div class="inner">
            <div class="group">
                <button
                    v-for="t in tabs"
                    :key="t.key"
                    class="tab"
                    :class="{ active: t.isActive() }"
                    type="button"
                    @click="go(t)"
                >
                    <component :is="t.icon" class="icon" />
                    <span class="label">{{ t.title }}</span>
                </button>
            </div>

            <button class="plus" type="button" aria-label="Create task" @click="createTask">
                <IconPlus class="plusIcon" />
            </button>
        </div>
    </nav>
</template>

<style scoped>
.tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    padding: 14px 18px calc(16px + env(safe-area-inset-bottom));
    pointer-events: none;
}

.inner {
    position: relative;
    margin: 0 auto;
    max-width: 420px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 32px;
    padding: 10px 14px;
    border-radius: 999px;
    background:
        radial-gradient(circle at 0 0, rgba(96, 165, 250, 0.35), transparent 55%),
        radial-gradient(circle at 100% 100%, rgba(244, 114, 182, 0.35), transparent 55%),
        rgba(18, 20, 31, 0.96);
    border: 1px solid rgba(148, 163, 184, 0.6);
    box-shadow:
        0 18px 45px rgba(15, 23, 42, 0.95),
        0 0 0 1px rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(18px);
    pointer-events: auto;
}

.group {
    display: grid;
    width: 100%;
    column-gap: 10px;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}

.tab {
    appearance: none;
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 4px;
    cursor: pointer;
    color: #9ca3af;
    border-radius: 999px;
    transition:
        background 0.16s ease,
        color 0.16s ease,
        transform 0.12s ease;
}

.tab:hover {
    background: rgba(15, 23, 42, 0.7);
    color: #e5e7eb;
}

.tab:active {
    transform: translateY(1px) scale(0.98);
}

.tab.active {
    background: linear-gradient(135deg, #6366f1, #ec4899);
    color: #f9fafb;
    box-shadow: 0 8px 22px rgba(79, 70, 229, 0.5);
}

.icon {
    width: 22px;
    height: 22px;
}

.label {
    font-size: 11px;
    line-height: 1.1;
}

.plus {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -54%);
    width: 56px;
    height: 56px;
    border-radius: 999px;
    border: 1px solid rgba(248, 250, 252, 0.72);
    background: radial-gradient(circle at 30% 0, #ffffff, #e5e7eb);
    color: #020617;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
        transform 0.18s ease,
        box-shadow 0.2s ease,
        filter 0.18s ease;
    box-shadow:
        0 16px 40px rgba(15, 23, 42, 0.9),
        0 0 0 4px rgba(15, 23, 42, 0.85);
}

.plus:hover {
    transform: translate(-50%, -60%) scale(1.05);
    filter: brightness(1.04);
    box-shadow:
        0 18px 48px rgba(15, 23, 42, 0.95),
        0 0 0 4px rgba(30, 64, 175, 0.5);
}

.plus:active {
    transform: translate(-50%, -52%) scale(0.97);
}

.plusIcon {
    width: 24px;
    height: 24px;
}

/* Hide on larger screens (desktop uses top nav) */
@media (min-width: 900px) {
    .tabbar {
        display: none;
    }
}
</style>
