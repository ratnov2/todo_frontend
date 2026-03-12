<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  IconHome,
  IconChecklist,
  IconCalendar,
  IconLayoutDashboard,
  IconTrophy,
  IconUser,
  IconPlus,
} from '@tabler/icons-vue'

const route = useRoute()

const links = [
  { key: 'home', title: 'Home', name: 'home', icon: IconHome },
  { key: 'tasks', title: 'Tasks', name: 'tasks', icon: IconChecklist },
  { key: 'today', title: 'Today', name: 'today', icon: IconCalendar },
  { key: 'dashboard', title: 'Dashboard', name: 'dashboard', icon: IconLayoutDashboard },
  { key: 'achievements', title: 'Achievements', name: 'achievements', icon: IconTrophy },
  { key: 'profile', title: 'Profile', name: 'profile', icon: IconUser },
] as const
</script>

<template>
  <header class="topbar">
    <div class="inner">
      <nav class="nav" aria-label="Main navigation">
        <RouterLink
          v-for="l in links"
          :key="l.key"
          class="link"
          :class="{ active: route.name === l.name }"
          :to="{ name: l.name }"
        >
          <component :is="l.icon" class="icon" />
          <span class="label">{{ l.title }}</span>
        </RouterLink>
      </nav>

      <RouterLink class="create" :to="{ name: 'creatingTask' }">
        <IconPlus class="createIcon" />
        <span class="createLabel">Создать задачу</span>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: radial-gradient(circle at 0 0, rgba(96, 165, 250, 0.4), transparent 55%),
    radial-gradient(circle at 100% 100%, rgba(244, 114, 182, 0.4), transparent 55%),
    rgba(15, 23, 42, 0.97);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.6);
  box-shadow:
    0 14px 36px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(15, 23, 42, 0.7);
}

.inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  color: #e5e7eb;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.12s ease;
}

.link:hover {
  background: rgba(15, 23, 42, 0.7);
  color: #f9fafb;
}

.link.active {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: #f9fafb;
  box-shadow: 0 10px 26px rgba(79, 70, 229, 0.55);
}

.icon {
  width: 18px;
  height: 18px;
}

.label {
  font-size: 13px;
}

.create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  background: radial-gradient(circle at 20% 0, #ffffff, #e5e7eb);
  color: #020617;
  text-decoration: none;
  border: 1px solid rgba(248, 250, 252, 0.7);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.9),
    0 0 0 3px rgba(15, 23, 42, 0.75);
  transition:
    transform 0.16s ease,
    box-shadow 0.2s ease,
    filter 0.16s ease;
}

.create:hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
  box-shadow:
    0 18px 46px rgba(15, 23, 42, 0.95),
    0 0 0 3px rgba(30, 64, 175, 0.6);
}

.createIcon {
  width: 18px;
  height: 18px;
}

.createLabel {
  font-size: 13px;
  line-height: 1;
}

/* Hide on mobile (mobile uses bottom tabbar) */
@media (max-width: 899px) {
  .topbar {
    display: none;
  }
}
</style>
