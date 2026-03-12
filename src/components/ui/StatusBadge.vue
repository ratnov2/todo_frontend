<script setup lang="ts">
import Badge from './Badge.vue'
import type { ITaskStatus } from '@/shared/services/task/task.types'
import { IconClock, IconLoader, IconCheck, IconCalendar, IconX } from '@tabler/icons-vue'

const props = defineProps<{
  status: ITaskStatus
}>()

const statusConfig: Record<ITaskStatus, { 
  label: string
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon: any
  iconColor?: string
}> = {
  pending: { label: 'Pending', variant: 'default', icon: IconClock, iconColor: '#94a3b8' },
  inProgress: { label: 'In Progress', variant: 'primary', icon: IconLoader, iconColor: '#a5b4fc' },
  done: { label: 'Done', variant: 'success', icon: IconCheck, iconColor: '#a7f3d0' },
  cancelled: { label: 'Cancelled', variant: 'default', icon: IconX, iconColor: '#94a3b8' },
}

const config = statusConfig[props.status] || { 
  label: props.status, 
  variant: 'default' as const,
  icon: IconClock
}
</script>

<template>
  <Badge :variant="config.variant" size="sm">
    <component 
      :is="config.icon" 
      :size="12" 
      :class="$style.icon"
      :style="config.iconColor ? { color: config.iconColor } : {}"
    />
    {{ config.label }}
  </Badge>
</template>

<style module>
.icon {
  flex-shrink: 0;
  opacity: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.badge:hover .icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.icon:global(.tabler-icon-loader) {
  animation: spin 1s linear infinite;
  filter: drop-shadow(0 0 4px rgba(165, 180, 252, 0.5));
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
