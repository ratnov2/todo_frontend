<template>
  <div :class="$style.progressBar">
    <div :class="$style.info">
      <span :class="$style.label">
        {{ current }} / {{ target }} {{ unit || '' }}
      </span>
      <button :class="$style.addButton" @click="$emit('add')">
        <IconPlus :size="14" />
        <span>Add progress</span>
      </button>
    </div>
    <div :class="$style.bar">
      <div
        :class="$style.fill"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconPlus } from '@tabler/icons-vue'

const props = defineProps<{
  current: number
  target: number
  unit?: string
}>()

defineEmits<{
  (e: 'add'): void
}>()

const percentage = computed(() => {
  if (props.target === 0) return 0
  return Math.min((props.current / props.target) * 100, 100)
})
</script>

<style module>
.progressBar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 13px;
  color: #ccc;
  font-weight: 500;
}

.addButton {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(37, 37, 37, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: #a5b4fc;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.addButton::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  opacity: 0;
  transition: opacity 0.3s;
}

.addButton:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.5);
  color: #c7d2fe;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.addButton:hover::before {
  opacity: 1;
}

.addButton:active {
  transform: translateY(0);
}

.bar {
  height: 8px;
  background: rgba(37, 37, 37, 0.8);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 0 12px rgba(99, 102, 241, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}
</style>
