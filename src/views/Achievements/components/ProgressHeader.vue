<template>
  <section :class="$style.header">
    <div :class="$style.top">
      <div :class="$style.titleWrap">
        <h1 :class="$style.title">Achievements &amp; Gamification</h1>
        <p :class="$style.subtitle">Track your progress, unlock badges, and climb the leaderboard.</p>
      </div>

      <button type="button" :class="$style.share" aria-label="Share (coming soon)" disabled>
        Share
      </button>
    </div>

    <div :class="$style.cards">
      <div :class="$style.card">
        <div :class="$style.kicker">Level</div>
        <div :class="$style.level">
          <span :class="$style.levelBadge">Lv {{ progress?.level ?? 0 }}</span>
          <span :class="$style.xpText">
            {{ xpText }}
          </span>
        </div>
        <div v-if="levelTitle" :class="$style.levelTitle">{{ levelTitle }}</div>
        <div :class="$style.progressBar" role="progressbar" :aria-valuenow="xpPercent" aria-valuemin="0"
          aria-valuemax="100">
          <div :class="$style.progressFill" :style="{ width: `${xpPercent}%` }" />
        </div>
      </div>

      <div :class="$style.card">
        <div :class="$style.kicker">Streak</div>
        <div :class="$style.streakRow">
          <div :class="$style.streakItem">
            <div :class="$style.streakValue">{{ progress?.streak ?? 0 }}</div>
            <div :class="$style.streakLabel">Current</div>
          </div>
          <div :class="$style.divider" />
          <div :class="$style.streakItem">
            <div :class="$style.streakValue">{{ progress?.bestStreak ?? 0 }}</div>
            <div :class="$style.streakLabel">Best</div>
          </div>
        </div>
      </div>

      <div :class="$style.card">
        <div :class="$style.kicker">Completed</div>
        <div :class="$style.completedValue">{{ progress?.totalCompletedTasks ?? 0 }}</div>
        <div :class="$style.completedLabel">tasks total</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GamificationProgressDto, LevelDto } from '@/shared/services/gamification/gamification.types'

const props = defineProps<{
  progress?: GamificationProgressDto | null
  levels?: LevelDto[] | null
}>()

const currentLevel = computed(() => {
  const levelNum = props.progress?.level
  if (!props.levels || levelNum === null || levelNum === undefined) return null
  return props.levels.find(l => l.level === levelNum) ?? null
})

const nextLevel = computed(() => {
  const levelNum = props.progress?.level
  if (!props.levels || levelNum === null || levelNum === undefined) return null
  return props.levels.find(l => l.level === levelNum + 1) ?? null
})

const levelTitle = computed(() => currentLevel.value?.title ?? null)

const xpPercent = computed(() => {
  const xp = props.progress?.xp ?? 0

  // Prefer level thresholds from /levels (xpNeeded is cumulative threshold)
  const curNeeded = currentLevel.value?.xpNeeded ?? 0
  const nextNeeded = nextLevel.value?.xpNeeded ?? props.progress?.nextLevelXp ?? 0

  if (nextNeeded <= curNeeded) return 0
  const within = xp - curNeeded
  const span = nextNeeded - curNeeded
  return Math.max(0, Math.min(100, Math.round((within / span) * 100)))
})

const xpText = computed(() => {
  const xp = props.progress?.xp ?? 0
  const curNeeded = currentLevel.value?.xpNeeded ?? 0
  const nextNeeded = nextLevel.value?.xpNeeded ?? props.progress?.nextLevelXp ?? 0
  if (nextNeeded > curNeeded) {
    // show progress within current level bracket
    return `${Math.max(0, xp - curNeeded)} / ${nextNeeded - curNeeded} XP`
  }
  // fallback
  return `${xp} / ${props.progress?.nextLevelXp ?? 0} XP`
})
</script>

<style module>
.header {
  padding: 28px 28px 10px 28px;
  position: relative;
}

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.titleWrap {
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f5f5f5;
}

.subtitle {
  margin: 6px 0 0 0;
  color: rgba(235, 235, 235, 0.65);
  font-size: 13px;
}

.share {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: #c7d2fe;
  font-weight: 700;
  cursor: not-allowed;
  opacity: 0.7;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.card {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(22, 22, 22, 0.9) 100%);
  border: 1px solid rgba(42, 42, 42, 0.65);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.35);
}

.kicker {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(235, 235, 235, 0.55);
  font-weight: 700;
  margin-bottom: 10px;
}

.level {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.levelTitle {
  margin-top: 8px;
  color: rgba(235, 235, 235, 0.62);
  font-size: 12px;
  font-weight: 800;
}

.levelBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: #a5b4fc;
  font-weight: 900;
  font-size: 12px;
}

.xpText {
  color: rgba(235, 235, 235, 0.75);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.progressBar {
  margin-top: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(37, 37, 37, 0.85);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
}

.progressFill {
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 14px rgba(99, 102, 241, 0.35);
}

.streakRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.streakItem {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.streakValue {
  color: #f5f5f5;
  font-size: 22px;
  font-weight: 900;
}

.streakLabel {
  color: rgba(235, 235, 235, 0.6);
  font-size: 12px;
  font-weight: 700;
}

.divider {
  width: 1px;
  height: 34px;
  background: rgba(42, 42, 42, 0.7);
}

.completedValue {
  color: #f5f5f5;
  font-size: 28px;
  font-weight: 900;
  line-height: 1.1;
}

.completedLabel {
  margin-top: 4px;
  color: rgba(235, 235, 235, 0.6);
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>

