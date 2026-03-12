<script setup lang="ts">
import { TaskService } from '@/shared/services/task/task.service'
import type {
    IReqDELETETask,
    IReqPOSTCreateTask,
    IResGETTasksAll,
    ITaskStatus,
} from '@/shared/services/task/task.types'
import { Delete } from '@element-plus/icons-vue'
import { IconChevronRight, IconPlus, IconX } from '@tabler/icons-vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { reactive } from 'vue'

import { ref, computed } from 'vue'
import { ElButton, ElCheckbox, ElIcon } from 'element-plus'
import { Calendar, Clock } from '@element-plus/icons-vue'
import type { Task } from '../TaskDashboard/types'

const props = defineProps<{
    task: Task
    showSubtasks: boolean
    level: number
}>()

const emit = defineEmits<{
    (e: 'task-toggle', payload: { taskId: number; checked: boolean }): void
    (e: 'progress-update', payload: { taskId: number; value: number }): void
}>()

const isExpanded = ref(false)

const hasSubtasks = computed(() => props.task.subtasks && props.task.subtasks.length > 0)

function onToggle(checked: boolean) {
    emit('task-toggle', { taskId: props.task.id, checked })
}

function handleProgressAdd() {
    if (!props.task.progress) return
    if (typeof props.task.progress !== 'object' || props.task.progress === null) return

    const next = Math.min(props.task.progress.current + 1, props.task.progress.target)

    emit('progress-update', {
        taskId: props.task.id,
        value: next,
    })
}

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString()
}

const allTasks = useQuery({
    queryKey: ['allTasks'],
    queryFn: () => TaskService.allTasks(),
})

const createTask = useMutation({
    mutationKey: ['createTask'],
    mutationFn: (data: IReqPOSTCreateTask) => TaskService.createTask(data),
    onSuccess() {
        allTasks.refetch()
    },
})

const today = new Date()

const formatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
}).format(today)
</script>

<template>
    <div>
        <div :class="$style.headerWrapper">
            <div :class="$style.header">
                <div :class="$style.headerContent">
                    <div :class="$style.title">
                        <h2>Today</h2>
                        <p>{{ formatted }}</p>
                    </div>
                    <el-button type="primary" color="#030213">
                        <IconPlus size="18" />
                        <span>Add</span>
                    </el-button>
                </div>
            </div>
            <div :class="$style.progressSection">
                <el-progress
                    type="circle"
                    :percentage="25"
                    :color="[{ color: '#030213', percentage: 0 }]"
                />
                <div :class="$style.progressInfo">
                    <p>5/7 tasks completed</p>
                    <el-progress :percentage="25" :color="[{ color: '#030213', percentage: 0 }]">
                        <span></span>
                    </el-progress>
                </div>
            </div>
        </div>
    </div>
</template>

<style module>
.header {
    display: flex;
    align-items: center;
}

.headerWrapper {
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 24px;
}

.headerContent {
    display: flex;
    width: 100%;
    align-items: center;
}

.headerContent > button {
    margin-left: auto;
}

.progressSection {
    display: flex;
    align-items: center;

    padding: 16px 0;
}

.progressInfo {
    margin-left: 24px;
    flex: 1;
}

.wrapper {
    position: relative;
}
</style>
