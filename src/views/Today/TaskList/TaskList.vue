<template>
    <div :class="$style.list">
        <TaskRow
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :show-subtasks="showSubtasks"
            :level="level"
            :telegram-enabled="telegramEnabled"
            @task-toggle="forwardToggle"
            @progress-update="forwardProgress"
        />
    </div>
</template>

<script setup lang="ts">
import type { Task } from '@/views/TaskDashboard/types'
import TaskRow from '@/views/TaskDashboard/components/TaskRow.vue'

const props = withDefaults(
    defineProps<{
        tasks: Task[]
        showSubtasks: boolean
        level?: number
        telegramEnabled: boolean
    }>(),
    {
        level: 0,
    }
)

const emit = defineEmits<{
    (e: 'task-toggle', payload: { taskId: number; checked: boolean }): void
    (e: 'progress-update', payload: { taskId: number; value: number }): void
}>()

function forwardToggle(payload: { taskId: number; checked: boolean }) {
    emit('task-toggle', payload)
}

function forwardProgress(payload: { taskId: number; value: number }) {
    emit('progress-update', payload)
}
</script>

<style module>
.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
