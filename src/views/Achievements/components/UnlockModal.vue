<template>
  <Teleport to="body">
    <div v-if="open" :class="$style.overlay" role="presentation">
      <div :class="$style.toast" role="dialog" aria-modal="true" :aria-labelledby="titleId">
        <div :class="$style.sparkle" aria-hidden="true" />
        <div :class="$style.content">
          <div :class="$style.media">
            <BadgeMedia
              :badge="badge"
              :size="120"
              :autoplay="true"
              :loop="false"
              :play-key="playKey"
              @complete="handleComplete"
            />
          </div>
          <div :class="$style.text">
            <div :class="$style.kicker">Achievement unlocked</div>
            <h2 :id="titleId" :class="$style.title">{{ achievementTitle }}</h2>
            <p :class="$style.desc">{{ achievementDescription }}</p>

            <div :class="$style.metaRow">
              <span v-if="xpReward !== null" :class="$style.xp">+{{ xpReward }} XP</span>
              <span v-if="badge?.rarity" :class="$style.rarity">{{ badge.rarity }}</span>
            </div>

            <div :class="$style.actions">
              <button type="button" :class="$style.button" @click="$emit('close')">Nice!</button>
              <button type="button" :class="[$style.button, $style.secondary]" @click="$emit('dismiss')">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BadgeMedia from '@/components/ui/BadgeMedia.vue'
import type { AchievementDto, BadgeDto } from '@/shared/services/gamification/gamification.types'

const props = defineProps<{
  open: boolean
  achievement?: AchievementDto | null
  badge?: BadgeDto | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'dismiss'): void
  (e: 'animation-finished'): void
}>()

const titleId = 'unlock-modal-title'
const playKey = ref(0)

watch(
  () => props.open,
  open => {
    if (open) playKey.value++
  }
)

const achievementTitle = computed(() => props.achievement?.title ?? 'New achievement')
const achievementDescription = computed(() => props.achievement?.description ?? '')
const xpReward = computed(() => (props.achievement?.xpReward ?? null))

const badge = computed(() => props.badge ?? props.achievement?.badge ?? null)

let finishedOnce = false
watch(
  () => playKey.value,
  () => {
    finishedOnce = false
  }
)

function handleComplete() {
  if (finishedOnce) return
  finishedOnce = true
  emit('animation-finished')
}
</script>

<style module>
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 20% 25%, rgba(99, 102, 241, 0.18), transparent 45%),
    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.16), transparent 50%),
    rgba(0, 0, 0, 0.68);
  z-index: 80;
  padding: 20px;
}

.toast {
  width: min(980px, 100%);
  border-radius: 18px;
  border: 1px solid rgba(99, 102, 241, 0.35);
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.96) 0%, rgba(18, 18, 18, 0.96) 100%);
  box-shadow: 0 30px 120px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(99, 102, 241, 0.15);
  overflow: hidden;
  position: relative;
}

.sparkle {
  position: absolute;
  inset: -80px;
  background:
    radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.18), transparent 35%),
    radial-gradient(circle at 70% 60%, rgba(168, 85, 247, 0.16), transparent 40%);
  filter: blur(10px);
  pointer-events: none;
}

.content {
  position: relative;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 18px;
  padding: 22px;
  align-items: center;
}

.media {
  display: grid;
  place-items: center;
}

.text {
  min-width: 0;
}

.kicker {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(235, 235, 235, 0.6);
  font-weight: 900;
}

.title {
  margin: 8px 0 0 0;
  color: #f5f5f5;
  font-weight: 900;
  font-size: 22px;
  letter-spacing: -0.02em;
}

.desc {
  margin: 8px 0 0 0;
  color: rgba(235, 235, 235, 0.65);
  font-size: 13px;
  line-height: 1.5;
}

.metaRow {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.xp,
.rarity {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.button {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.35);
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background: rgba(99, 102, 241, 0.24);
  border-color: rgba(99, 102, 241, 0.5);
}

.secondary {
  background: rgba(37, 37, 37, 0.6);
  border-color: rgba(42, 42, 42, 0.8);
  color: rgba(235, 235, 235, 0.85);
}

@media (max-width: 820px) {
  .content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .metaRow,
  .actions {
    justify-content: center;
  }
}
</style>

