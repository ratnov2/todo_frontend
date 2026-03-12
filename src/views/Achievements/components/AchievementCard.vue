<template>
  <button
    type="button"
    :class="[
      $style.card,
      unlocked && $style.unlocked,
      locked && $style.locked,
      isHiddenLocked && $style.hiddenLocked,
    ]"
    @click="$emit('click')"
  >
    <div :class="$style.badgeWrap">
      <BadgeMedia :badge="achievement.badge" :size="56" :autoplay="false" />
      <span v-if="achievement.isHidden" :class="$style.hiddenLabel">Hidden</span>
    </div>

    <div :class="$style.content">
      <div :class="$style.header">
        <div :class="$style.titleRow">
          <div :class="$style.title">
            {{ displayTitle }}
          </div>
          <div v-if="achievement.xpReward !== undefined" :class="$style.xp">
            +{{ achievement.xpReward }} XP
          </div>
        </div>
        <div :class="$style.desc">
          {{ displayDescription }}
        </div>
      </div>

      <div v-if="progress && progress.target > 0 && !unlocked" :class="$style.progress">
        <div :class="$style.progressBar" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0"
          aria-valuemax="100">
          <div :class="$style.progressFill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div :class="$style.progressText">{{ progress.current }} / {{ progress.target }}</div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BadgeMedia from '@/components/ui/BadgeMedia.vue'
import type { AchievementDto } from '@/shared/services/gamification/gamification.types'

const props = defineProps<{
  achievement: AchievementDto
  unlocked: boolean
  progress?: { current: number; target: number } | null
}>()

defineEmits<{
  (e: 'click'): void
}>()

const locked = computed(() => !props.unlocked)
const isHiddenLocked = computed(() => Boolean(props.achievement.isHidden) && locked.value)

const displayTitle = computed(() => {
  if (isHiddenLocked.value) return 'Hidden achievement'
  return props.achievement.title
})

const displayDescription = computed(() => {
  if (isHiddenLocked.value) return 'Unlock to reveal the details.'
  return props.achievement.description ?? ''
})

const progressPercent = computed(() => {
  if (!props.progress || props.progress.target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((props.progress.current / props.progress.target) * 100)))
})
</script>

<style module>
.card {
  display: flex;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(42, 42, 42, 0.65);
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(22, 22, 22, 0.9) 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(99, 102, 241, 0.15);
}

.badgeWrap {
  position: relative;
  flex-shrink: 0;
}

.hiddenLabel {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(37, 37, 37, 0.9);
  border: 1px solid rgba(42, 42, 42, 0.8);
  color: rgba(235, 235, 235, 0.7);
  font-size: 10px;
  font-weight: 800;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.titleRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.title {
  color: #f5f5f5;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.xp {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.28);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}

.desc {
  margin-top: 4px;
  color: rgba(235, 235, 235, 0.62);
  font-size: 12px;
  line-height: 1.45;
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progressBar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(37, 37, 37, 0.85);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
}

.progressFill {
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progressText {
  color: rgba(235, 235, 235, 0.6);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.locked {
  opacity: 0.95;
}

.hiddenLocked {
  filter: saturate(0.85);
}

.unlocked {
  border-color: rgba(99, 102, 241, 0.35);
}
</style>

