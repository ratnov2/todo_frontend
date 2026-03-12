<template>
  <div :class="$style.stats">
    <div :class="$style.grid">
      <!-- Total Tasks -->
      <div :class="[$style.card, $style.totalCard]">
        <div :class="$style.cardContent">
          <div :class="$style.iconWrapper">
            <IconChecklist :size="24" />
          </div>
          <div :class="$style.info">
            <div :class="$style.label">Total Tasks</div>
            <div :class="$style.value" :data-value="stats?.total || 0">
              {{ animatedTotal }}
            </div>
          </div>
        </div>
        <div :class="$style.glow" />
      </div>

      <!-- Today -->
      <div :class="[$style.card, $style.todayCard]">
        <div :class="$style.cardContent">
          <div :class="$style.iconWrapper">
            <IconCalendar :size="24" />
          </div>
          <div :class="$style.info">
            <div :class="$style.label">Today</div>
            <div :class="$style.value" :data-value="stats?.today || 0">
              {{ animatedToday }}
            </div>
          </div>
        </div>
        <div :class="$style.glow" />
      </div>

      <!-- Progressive Today -->
      <div :class="[$style.card, $style.progressiveCard]">
        <div :class="$style.cardContent">
          <div :class="$style.iconWrapper">
            <IconChartBar :size="24" />
          </div>
          <div :class="$style.info">
            <div :class="$style.label">Progressive Today</div>
            <div :class="$style.value" :data-value="stats?.progressiveToday || 0">
              {{ animatedProgressive }}
            </div>
          </div>
        </div>
        <div :class="$style.glow" />
      </div>

      <!-- Status Breakdown -->
      <div :class="[$style.card, $style.statusCard]">
        <div :class="$style.cardHeader">
          <IconCircle :size="20" />
          <span>By Status</span>
        </div>
        <div :class="$style.statusList">
          <div :class="[$style.statusItem, $style.done]">
            <div :class="$style.statusInfo">
              <IconCheck :size="16" />
              <span>Done</span>
            </div>
            <div :class="$style.statusValue" :data-value="stats?.byStatus?.done || 0">
              {{ animatedDone }}
            </div>
          </div>
          <div :class="[$style.statusItem, $style.inProgress]">
            <div :class="$style.statusInfo">
              <IconLoader :size="16" />
              <span>In Progress</span>
            </div>
            <div :class="$style.statusValue" :data-value="stats?.byStatus?.inProgress || 0">
              {{ animatedInProgress }}
            </div>
          </div>
          <div :class="[$style.statusItem, $style.pending]">
            <div :class="$style.statusInfo">
              <IconClock :size="16" />
              <span>Pending</span>
            </div>
            <div :class="$style.statusValue" :data-value="stats?.byStatus?.pending || 0">
              {{ animatedPending }}
            </div>
          </div>
          <div :class="[$style.statusItem, $style.cancelled]">
            <div :class="$style.statusInfo">
              <IconX :size="16" />
              <span>Cancelled</span>
            </div>
            <div :class="$style.statusValue" :data-value="stats?.byStatus?.cancelled || 0">
              {{ animatedCancelled }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  IconChecklist,
  IconCalendar,
  IconChartBar,
  IconCircle,
  IconCheck,
  IconLoader,
  IconClock,
  IconX,
} from '@tabler/icons-vue'
import type { IResGETTasksStats } from '@/shared/services/task/task.types'

const props = defineProps<{
  stats?: IResGETTasksStats
}>()

const animatedTotal = ref(0)
const animatedToday = ref(0)
const animatedProgressive = ref(0)
const animatedDone = ref(0)
const animatedInProgress = ref(0)
const animatedPending = ref(0)
const animatedCancelled = ref(0)

function animateValue(
  current: number,
  target: number,
  duration: number,
  callback: (value: number) => void
) {
  const start = current
  const change = target - start
  const startTime = performance.now()

  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const value = Math.floor(start + change * easeOut)
    callback(value)

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      callback(target)
    }
  }

  requestAnimationFrame(update)
}

function updateAnimatedValues() {
  if (!props.stats) return

  animateValue(animatedTotal.value, props.stats.total, 1000, (v) => {
    animatedTotal.value = v
  })
  animateValue(animatedToday.value, props.stats.today, 800, (v) => {
    animatedToday.value = v
  })
  animateValue(animatedProgressive.value, props.stats.progressiveToday, 800, (v) => {
    animatedProgressive.value = v
  })
  animateValue(animatedDone.value, props.stats.byStatus.done, 1000, (v) => {
    animatedDone.value = v
  })
  animateValue(animatedInProgress.value, props.stats.byStatus.inProgress, 1000, (v) => {
    animatedInProgress.value = v
  })
  animateValue(animatedPending.value, props.stats.byStatus.pending, 1000, (v) => {
    animatedPending.value = v
  })
  animateValue(animatedCancelled.value, props.stats.byStatus.cancelled, 1000, (v) => {
    animatedCancelled.value = v
  })
}

watch(() => props.stats, updateAnimatedValues, { deep: true })
onMounted(() => {
  if (props.stats) {
    updateAnimatedValues()
  }
})
</script>

<style module>
.stats {
  margin-bottom: 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(24, 24, 24, 0.9) 100%);
  border: 1px solid rgba(42, 42, 42, 0.6);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.2),
    0 4px 16px rgba(99, 102, 241, 0.15);
}

.card:hover::before {
  opacity: 1;
}

.glow {
  position: absolute;
  inset: -2px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  opacity: 0;
  transition: opacity 0.4s;
  z-index: -1;
  filter: blur(20px);
}

.card:hover .glow {
  opacity: 0.6;
}

.cardContent {
  display: flex;
  align-items: center;
  gap: 16px;
}

.iconWrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.4s;
}

.totalCard .iconWrapper {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15));
  color: #a5b4fc;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.todayCard .iconWrapper {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15));
  color: #93c5fd;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.progressiveCard .iconWrapper {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.15));
  color: #c4b5fd;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.card:hover .iconWrapper {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.info {
  flex: 1;
  min-width: 0;
}

.label {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 32px;
  font-weight: 700;
  color: #f5f5f5;
  line-height: 1;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s;
}

.card:hover .value {
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));
}

/* Status Card */
.statusCard {
  grid-column: span 2;
}

.cardHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(42, 42, 42, 0.6);
}

.statusList {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.statusItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 10px;
  background: rgba(37, 37, 37, 0.5);
  border: 1px solid rgba(42, 42, 42, 0.6);
  transition: all 0.3s;
}

.statusItem:hover {
  background: rgba(42, 42, 42, 0.7);
  transform: translateX(4px);
  border-color: rgba(99, 102, 241, 0.3);
}

.statusInfo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ccc;
  font-weight: 500;
}

.statusValue {
  font-size: 20px;
  font-weight: 700;
  transition: all 0.3s;
}

.done .statusInfo {
  color: #86efac;
}

.done .statusValue {
  color: #a7f3d0;
}

.inProgress .statusInfo {
  color: #a5b4fc;
}

.inProgress .statusValue {
  color: #c7d2fe;
}

.pending .statusInfo {
  color: #cbd5e1;
}

.pending .statusValue {
  color: #e2e8f0;
}

.cancelled .statusInfo {
  color: #94a3b8;
}

.cancelled .statusValue {
  color: #cbd5e1;
}

.statusItem:hover .statusValue {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .statusCard {
    grid-column: span 1;
  }

  .statusList {
    grid-template-columns: 1fr;
  }
}
</style>
