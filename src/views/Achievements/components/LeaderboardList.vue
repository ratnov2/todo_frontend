<template>
  <section :class="$style.card" aria-label="Leaderboard">
    <div :class="$style.header">
      <h2 :class="$style.title">Leaderboard</h2>
      <div :class="$style.controls">
        <select v-model="model" :class="$style.select" aria-label="Leaderboard period">
          <option value="all_time">All time</option>
          <option :value="weekValue">This week</option>
          <option :value="monthValue">This month</option>
        </select>
      </div>
    </div>

    <div v-if="loading" :class="$style.loading">Loading…</div>
    <div v-else-if="!entries || entries.length === 0" :class="$style.empty">No data yet.</div>
    <ol v-else :class="$style.list">
      <li v-for="row in entries.slice(0, 10)" :key="row.userId" :class="$style.item">
        <div :class="$style.rank">#{{ row.rank }}</div>
        <div :class="$style.name">{{ row.userName ?? `User ${row.userId}` }}</div>
        <div :class="$style.score">{{ row.score }}</div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LeaderboardEntryDto, LeaderboardPeriod } from '@/shared/services/gamification/gamification.types'

const props = defineProps<{
  entries?: LeaderboardEntryDto[] | null
  loading?: boolean
  modelValue: LeaderboardPeriod
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: LeaderboardPeriod): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const now = new Date()
const weekValue = computed<LeaderboardPeriod>(() => {
  // Monday as week start (simple)
  const d = new Date(now)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  const iso = d.toISOString().slice(0, 10)
  return `week_${iso}`
})

const monthValue = computed<LeaderboardPeriod>(() => {
  const isoMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return `month_${isoMonth}`
})
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
  align-items: center;
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

.select {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(37, 37, 37, 0.75);
  border: 1px solid rgba(42, 42, 42, 0.8);
  color: rgba(235, 235, 235, 0.85);
  font-weight: 700;
  outline: none;
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
  gap: 8px;
}

.item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(42, 42, 42, 0.55);
  background: rgba(15, 15, 15, 0.35);
}

.rank {
  color: rgba(235, 235, 235, 0.7);
  font-weight: 900;
  font-size: 12px;
}

.name {
  color: #f5f5f5;
  font-weight: 800;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  color: #a5b4fc;
  font-weight: 900;
  font-size: 13px;
}
</style>

