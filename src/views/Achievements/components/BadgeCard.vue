<template>
  <div :class="$style.card">
    <div :class="$style.top">
      <BadgeMedia
        :badge="userBadge.badge"
        :size="56"
        :autoplay="false"
      />
      <div :class="$style.meta">
        <div :class="$style.titleRow">
          <div :class="$style.title">{{ userBadge.badge?.title ?? 'Badge' }}</div>
          <span :class="$style.state">{{ userBadge.animationState }}</span>
        </div>
        <div :class="$style.desc">
          {{ userBadge.badge?.description ?? '' }}
        </div>
        <div v-if="userBadge.badge?.rarity" :class="$style.rarity">
          {{ userBadge.badge.rarity }}
        </div>
      </div>
    </div>

    <div :class="$style.actions">
      <button type="button" :class="$style.button" @click="$emit('replay')">
        Replay
      </button>
      <button
        v-if="userBadge.animationState === 'not_shown'"
        type="button"
        :class="[$style.button, $style.primary]"
        @click="$emit('mark-seen')"
      >
        Mark as shown
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BadgeMedia from '@/components/ui/BadgeMedia.vue'
import type { UserBadgeDto } from '@/shared/services/gamification/gamification.types'

defineProps<{
  userBadge: UserBadgeDto
}>()

defineEmits<{
  (e: 'replay'): void
  (e: 'mark-seen'): void
}>()
</script>

<style module>
.card {
  border: 1px solid rgba(42, 42, 42, 0.65);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(22, 22, 22, 0.9) 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top {
  display: flex;
  gap: 12px;
}

.meta {
  flex: 1;
  min-width: 0;
}

.titleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.title {
  color: #f5f5f5;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.state {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.28);
  color: #a5b4fc;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
  text-transform: uppercase;
}

.desc {
  margin-top: 6px;
  color: rgba(235, 235, 235, 0.62);
  font-size: 12px;
  line-height: 1.45;
}

.rarity {
  margin-top: 8px;
  color: rgba(235, 235, 235, 0.7);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.28);
  background: rgba(99, 102, 241, 0.08);
  color: #c7d2fe;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background: rgba(99, 102, 241, 0.14);
  border-color: rgba(99, 102, 241, 0.42);
}

.primary {
  background: rgba(99, 102, 241, 0.18);
}
</style>

