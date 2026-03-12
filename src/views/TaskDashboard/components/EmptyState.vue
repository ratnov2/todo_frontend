<template>
  <div :class="$style.emptyState">
    <div :class="$style.illustration">
      <IconChecklist :size="64" />
    </div>
    <h2 :class="$style.title">No tasks yet</h2>
    <p :class="$style.description">
      Get started by creating your first task or adjusting your filters.
    </p>
  </div>
</template>

<script setup lang="ts">
import { IconChecklist } from '@tabler/icons-vue'
</script>

<style module>
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  position: relative;
}

.illustration {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(24, 24, 24, 0.9) 100%);
  border: 2px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  margin-bottom: 32px;
  position: relative;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.1),
    inset 0 0 40px rgba(99, 102, 241, 0.1);
  animation: pulse 3s ease-in-out infinite;
}

.illustration::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  opacity: 0;
  animation: ripple 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(99, 102, 241, 0.1),
      inset 0 0 40px rgba(99, 102, 241, 0.1);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 
      0 12px 40px rgba(99, 102, 241, 0.3),
      0 0 0 1px rgba(99, 102, 241, 0.2),
      inset 0 0 50px rgba(99, 102, 241, 0.15);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

.description {
  font-size: 14px;
  color: #999;
  margin: 0;
  max-width: 400px;
  line-height: 1.6;
}
</style>
