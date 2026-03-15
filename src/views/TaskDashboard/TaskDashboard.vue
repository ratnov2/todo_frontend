<template>
    <div :class="$style.dashboard">
        <!-- Top Bar -->
        <TopBar
            :search-query="filters.search"
            @search-update="filters.search = $event"
            @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />

        <div :class="$style.content">
            <!-- Left Sidebar -->
            <FilterSidebar
                v-model:status="filters.status"
                v-model:type="filters.type"
                v-model:priority="filters.priority"
                v-model:owner="filters.owner"
                v-model:show-subtasks="filters.showSubtasks"
                v-model:date-filter="filters.dateFilter"
                v-model:custom-start-date="filters.customStartDate"
                v-model:custom-end-date="filters.customEndDate"
                v-model:sort="filters.sort"
                :is-open="sidebarOpen"
                @close="sidebarOpen = false"
            />

            <!-- Main Content -->
            <main :class="[$style.main, !sidebarOpen && $style.mainExpanded]">
                <!-- Stats Section -->
                <TaskStats :stats="statsQuery.data.value" />

                <div v-if="tasksQuery.isLoading.value" :class="$style.loading">
                    <SkeletonLoader v-for="i in 5" :key="i" />
                </div>

                <EmptyState v-else-if="filteredTasks.length === 0" />

                <TaskList
                    v-else
                    :tasks="filteredTasks"
                    :show-subtasks="filters.showSubtasks"
                    :telegram-enabled="isTelegramEnabled"
                    @task-toggle="handleTaskToggle"
                    @progress-update="handleProgressUpdate"
                    @series-complete="handleSeriesComplete"
                    @cancel-task="handleCancelTask"
                />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { TaskService } from '@/shared/services/task/task.service'
import type {
    ITask,
    ITaskSchedule,
    ITaskStatus,
    TaskType,
    IReqGETTasksAll,
} from '@/shared/services/task/task.types'
import TopBar from './components/TopBar.vue'
import FilterSidebar from './components/FilterSidebar.vue'
import TaskList from './components/TaskList.vue'
import EmptyState from './components/EmptyState.vue'
import SkeletonLoader from './components/SkeletonLoader.vue'
import TaskStats from './components/TaskStats.vue'
import type { Task } from './types'
import { UserService } from '@/shared/services/user/User.service'

// Convert ITask to Task with proper mapping (recursive for subtasks)
const WEEK_DAYS_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function computeNextRunForSchedule(schedule: ITaskSchedule, now: Date): Date | null {
    if (!schedule) return null

    const startDate = schedule.runAt ? new Date(schedule.runAt) : null
    if (startDate && isNaN(startDate.getTime())) return null

    const [hours, minutes] = (schedule.timeOfDay ?? '')
        .split(':')
        .map((v: string) => Number(v || 0))

    // Weekly schedule with specific days of week
    if (Array.isArray(schedule.daysOfWeek) && schedule.daysOfWeek.length > 0) {
        for (let i = 0; i < 14; i++) {
            const candidate = new Date(now)
            candidate.setDate(now.getDate() + i)
            candidate.setHours(hours || 0, minutes || 0, 0, 0)

            if (startDate && candidate < startDate) continue

            if (
                schedule.daysOfWeek.includes(candidate.getDay()) &&
                candidate.getTime() > now.getTime()
            ) {
                return candidate
            }
        }
        return null
    }

    // Monthly schedule
    if (schedule.dayOfMonth) {
        const candidate = new Date(now)
        candidate.setDate(schedule.dayOfMonth)
        candidate.setHours(hours || 0, minutes || 0, 0, 0)

        if (startDate && candidate < startDate) {
            candidate.setMonth(candidate.getMonth() + 1)
        }
        if (candidate.getTime() <= now.getTime()) {
            candidate.setMonth(candidate.getMonth() + 1)
        }

        return candidate
    }

    // Fallback to runAt
    if (startDate && startDate.getTime() > now.getTime()) {
        return startDate
    }

    return null
}

function getNextRunFromSchedules(task: ITask): string | undefined {
    if (!task.schedules || task.schedules.length === 0) return undefined

    const now = new Date()

    const candidates = task.schedules
        .map((s) => computeNextRunForSchedule(s, now))
        .filter((d: Date | null): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime())

    if (candidates.length === 0) return undefined

    return candidates[0]?.toISOString()
}

function getScheduleInfo(task: ITask): string | undefined {
    if (!task.schedules || task.schedules.length === 0) return undefined

    const s = task.schedules[0]
    if (!s) return undefined

    const timeLabel: string | undefined = s.timeOfDay

    if (Array.isArray(s.daysOfWeek) && s.daysOfWeek.length > 0) {
        const days =
            s.daysOfWeek.length === 7
                ? 'Каждый день'
                : s.daysOfWeek.map((d: number) => WEEK_DAYS_SHORT_RU[d] ?? String(d)).join(', ')

        return timeLabel ? `${days} • ${timeLabel}` : days
    }

    if (s.dayOfMonth) {
        const base = `Каждый ${s.dayOfMonth}-го`
        return timeLabel ? `${base} • ${timeLabel}` : base
    }

    if (timeLabel) {
        return `В ${timeLabel}`
    }

    return undefined
}

function mapTask(task: ITask): Task {
    // Map status: 'pending' -> 'todo'
    const mappedStatus: ITaskStatus = task.status === 'pending' ? 'pending' : task.status

    const mappedSubtasks = task.subtasks ? task.subtasks.map(mapTask) : []
    const nestedSubtasksCount = mappedSubtasks.reduce(
        (acc, subtask) => acc + 1 + (subtask.nestedSubtasksCount ?? 0),
        0
    )

    return {
        id: task.id,
        userId: task.ownerId! || task.owner?.id!,
        title: task.title,
        description: task.description || '',
        isComplex: Boolean(task.subtasks && task.subtasks.length > 0),
        nestedSubtasksCount,
        status: mappedStatus,
        progress: task.progressMeta
            ? {
                  current: 0, // Will be calculated from progressEntries
                  target: task.progressMeta.targetValue,
                  unit: task.progressMeta.unit,
              }
            : undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt || task.createdAt,
        dueDate: task.scheduledFor || '',
        type: task.type || 'ONCE',
        priority: task.priority ?? 0,
        owner: task.owner?.name || task.owner?.email || 'You',
        nextRun: getNextRunFromSchedules(task),
        scheduleInfo: getScheduleInfo(task),
        scheduledFor: task.scheduledFor || null,
        completed: task.status === 'done',
        progressMeta: task.progressMeta || undefined,
        progressEntries: task.progressEntries || [],
        currentInstance: task.currentInstance ?? null,
        subtasks: mappedSubtasks,
    }
}

const sidebarOpen = ref(true)

const filters = reactive({
    search: '',
    status: [] as ITaskStatus[],
    type: [] as TaskType[],
    priority: [] as number[],
    owner: [] as string[],
    showSubtasks: true,
    dateFilter: 'all' as 'all' | 'today' | 'yesterday' | 'custom',
    customStartDate: '',
    customEndDate: '',
    sort: 'newest' as 'newest' | 'oldest',
})

// Computed query params for API
const queryParams = computed(() => {
    const params: IReqGETTasksAll = {}

    if (filters.status.length > 0) {
        params.status = filters.status
    }

    if (filters.type.length > 0) {
        params.type = filters.type
    }

    if (filters.search) {
        params.q = filters.search
    }

    if (filters.sort) {
        params.sort = filters.sort
    }

    // Date filters
    if (filters.dateFilter === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        params.startDate = today.toISOString()
        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)
        params.endDate = endOfToday.toISOString()
    } else if (filters.dateFilter === 'yesterday') {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)
        params.startDate = yesterday.toISOString()
        const endOfYesterday = new Date()
        endOfYesterday.setDate(endOfYesterday.getDate() - 1)
        endOfYesterday.setHours(23, 59, 59, 999)
        params.endDate = endOfYesterday.toISOString()
    } else if (filters.dateFilter === 'custom') {
        if (filters.customStartDate) {
            const startDate = new Date(filters.customStartDate)
            startDate.setHours(0, 0, 0, 0)
            params.startDate = startDate.toISOString()
        }
        if (filters.customEndDate) {
            const endDate = new Date(filters.customEndDate)
            endDate.setHours(23, 59, 59, 999)
            params.endDate = endDate.toISOString()
        }
    }

    // Note: priority and owner filters are kept client-side as they might not be in API
    // If API supports ownerId, we can add it here

    return params
})

const tasksQuery = useQuery({
    queryKey: ['allTasks', queryParams],
    queryFn: () => TaskService.allTasks(queryParams.value),
})

const statsQuery = useQuery({
    queryKey: ['tasksStats'],
    queryFn: () => TaskService.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
})

const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => UserService.getMe(),
})

const tasks = computed(() => {
    const rawTasks = tasksQuery.data.value?.items || []
    // Filter only root tasks (parentId is null/undefined) and map them
    return rawTasks
        .filter((task) => task.parentId === null || task.parentId === undefined)
        .map(mapTask)
})

const isTelegramEnabled = computed(() => {
    return Boolean(meQuery.data.value?.telegramEnabled)
})

const filteredTasks = computed(() => {
    let result = [...tasks.value]

    // Priority filter (client-side, as it might not be in API)
    if (filters.priority.length > 0) {
        result = result.filter(
            (task) => task.priority !== undefined && filters.priority.includes(task.priority)
        )
    }

    // Owner filter (client-side, as it might not be in API)
    if (filters.owner.length > 0) {
        result = result.filter((task) => task.owner && filters.owner.includes(task.owner))
    }

    return result
})

const updateTaskMutation = useMutation({
    mutationKey: ['updateTask'],
    mutationFn: async (data: { taskId: number; checked: boolean }) => {
        const task = tasks.value.find((t) => t.id === data.taskId)

        // For SCHEDULED tasks with currentInstance we only update the instance
        if (task?.type === 'SCHEDULED' && task.currentInstance) {
            await TaskService.updateTaskInstance({
                instanceId: task.currentInstance.id,
                status: data.checked ? 'done' : 'pending',
            })
            return
        }

        const nextStatus: ITaskStatus = data.checked ? 'done' : 'pending'

        await TaskService.updateTask({
            id: data.taskId,
            status: nextStatus,
        })
    },
    onSuccess: () => {
        tasksQuery.refetch()
        statsQuery.refetch()
    },
})

const completeScheduledTaskMutation = useMutation({
    mutationKey: ['completeScheduledTask'],
    mutationFn: async (data: { taskId: number }) => {
        await TaskService.updateTask({
            id: data.taskId,
            status: 'done',
        })
    },
    onSuccess: () => {
        tasksQuery.refetch()
        statsQuery.refetch()
    },
})

const cancelTaskMutation = useMutation({
    mutationKey: ['cancelTask'],
    mutationFn: async (data: { taskId: number }) => {
        await TaskService.updateTask({
            id: data.taskId,
            status: 'cancelled',
        })
    },
    onSuccess: () => {
        tasksQuery.refetch()
        statsQuery.refetch()
    },
})

const updateProgressMutation = useMutation({
    mutationKey: ['updateProgress'],
    mutationFn: async (data: { taskId: number; value: number }) => {
        await TaskService.addProgressEntry({
            taskId: data.taskId,
            dto: {
                amount: data.value - (tasks.value.find((t) => t.id === data.taskId)?.progressEntries
                    ?.reduce((sum, e) => sum + e.amount, 0) ?? 0),
            },
        })
    },
    onSuccess: () => {
        tasksQuery.refetch()
        statsQuery.refetch()
    },
})

function handleTaskToggle(payload: { taskId: number; checked: boolean }) {
    updateTaskMutation.mutate(payload)
}

function handleProgressUpdate(payload: { taskId: number; value: number }) {
    updateProgressMutation.mutate(payload)
}

function handleSeriesComplete(payload: { taskId: number }) {
    completeScheduledTaskMutation.mutate(payload)
}

function handleCancelTask(payload: { taskId: number }) {
    cancelTaskMutation.mutate(payload)
}
</script>

<style module>
.dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
    color: #f5f5f5;
    display: flex;
    flex-direction: column;
    position: relative;
}

.dashboard::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
}

.content {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.main {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 32px;
    padding-left: 40px;
    padding-right: 40px;
    scroll-behavior: smooth;
    transition: padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mainExpanded {
    padding-left: 40px;
}

.main::-webkit-scrollbar {
    width: 8px;
}

.main::-webkit-scrollbar-track {
    background: #0f0f0f;
}

.main::-webkit-scrollbar-thumb {
    background: #2a2a2a;
    border-radius: 4px;
}

.main::-webkit-scrollbar-thumb:hover {
    background: #3a3a3a;
}

.loading {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
