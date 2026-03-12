<script setup lang="ts">
import Badge from './Badge.vue'
import { IconCheck, IconCalendar, IconAlertCircle, IconChartBar } from '@tabler/icons-vue'

type TaskType = 'ONCE' | 'SCHEDULED' | 'DEADLINE' | 'PROGRESSIVE' | 'once' | 'scheduled' | 'deadline' | 'progressive'

const props = defineProps<{
  type: TaskType
}>()

const typeConfig: Record<string, { 
  label: string
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon: any
  iconColor?: string
}> = {
  ONCE: { label: 'Once', variant: 'default', icon: IconCheck, iconColor: '#cbd5e1' },
  once: { label: 'Once', variant: 'default', icon: IconCheck, iconColor: '#cbd5e1' },
  SCHEDULED: { label: 'Scheduled', variant: 'info', icon: IconCalendar, iconColor: '#bfdbfe' },
  scheduled: { label: 'Scheduled', variant: 'info', icon: IconCalendar, iconColor: '#bfdbfe' },
  DEADLINE: { label: 'Deadline', variant: 'warning', icon: IconAlertCircle, iconColor: '#fed7aa' },
  deadline: { label: 'Deadline', variant: 'warning', icon: IconAlertCircle, iconColor: '#fed7aa' },
  PROGRESSIVE: { label: 'Progressive', variant: 'primary', icon: IconChartBar, iconColor: '#c7d2fe' },
  progressive: { label: 'Progressive', variant: 'primary', icon: IconChartBar, iconColor: '#c7d2fe' },
}

const config = typeConfig[props.type] || { 
  label: props.type, 
  variant: 'default' as const,
  icon: IconCheck
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
</style>
