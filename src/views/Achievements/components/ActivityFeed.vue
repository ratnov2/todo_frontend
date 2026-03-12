<template>
  <section :class="$style.card" aria-label="Activity feed">
    <div :class="$style.header">
      <h2 :class="$style.title">Activity</h2>
      <span :class="$style.subtitle">Latest unlocks &amp; events</span>
    </div>

    <div v-if="loading" :class="$style.loading">Loading…</div>
    <div v-else-if="!items || items.length === 0" :class="$style.empty">No activity yet.</div>
    <ul v-else :class="$style.list">
      <li v-for="(e, idx) in items.slice(0, 20)" :key="e.id ?? `${e.type}-${e.createdAt}-${idx}`" :class="$style.item">
        <div :class="$style.dot" aria-hidden="true" />
        <div :class="$style.main">
          <div :class="$style.line1">
            <span :class="$style.eventType">{{ e.type }}</span>
            <span :class="$style.time">{{ formatTime(e.createdAt) }}</span>
          </div>
          <div v-if="e.message" :class="$style.message">{{ e.message }}</div>
          <div v-else-if="e.userName" :class="$style.message">{{ e.userName }}</div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { ActivityEventDto } from '@/shared/services/gamification/gamification.types'

defineProps<{
  items?: ActivityEventDto[] | null
  loading?: boolean
}>()

function formatTime(date: string) {
  try {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return date
  }
}
</script>

<style module>
.card {
  border: 1px solid rgba(42, 42, 42, 0.65);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(22, 22, 22, 0.9) 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
  padding: 14px;
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.title {
  margin: 0;
  color: #f5f5f5;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.subtitle {
  color: rgba(235, 235, 235, 0.55);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.loading,
.empty {
  color: rgba(235, 235, 235, 0.65);
  font-size: 12px;
  font-weight: 700;
  padding: 10px 0;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 10px;
  align-items: start;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 5px;
  background: rgba(99, 102, 241, 0.8);
  box-shadow: 0 0 14px rgba(99, 102, 241, 0.45);
}

.main {
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(42, 42, 42, 0.55);
  background: rgba(15, 15, 15, 0.35);
}

.line1 {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.eventType {
  color: #f5f5f5;
  font-weight: 900;
  font-size: 12px;
}

.time {
  color: rgba(235, 235, 235, 0.55);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.message {
  margin-top: 6px;
  color: rgba(235, 235, 235, 0.62);
  font-size: 12px;
}
</style>

