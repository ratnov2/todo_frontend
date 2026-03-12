<template>
    <div :class="$style.list">
        <TaskRow
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :show-subtasks="showSubtasks"
            :level="0"
            :telegram-enabled="telegramEnabled"
            @task-toggle="$emit('task-toggle', $event)"
            @progress-update="$emit('progress-update', $event)"
            @series-complete="$emit('series-complete', $event)"
        />
    </div>
</template>

<script setup lang="ts">
import TaskRow from './TaskRow.vue'
import type { Task } from '../types'

const props = defineProps<{
    tasks: Task[]
    showSubtasks: boolean
    telegramEnabled: boolean
}>()

defineEmits<{
    (e: 'task-toggle', payload: { taskId: number; checked: boolean }): void
    (e: 'progress-update', payload: { taskId: number; value: number }): void
    (e: 'series-complete', payload: { taskId: number }): void
}>()
</script>

<style module>
.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
