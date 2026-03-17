<template>
    <section :class="$style.wrapper">
        <header :class="$style.header">
            <div>
                <h2 :class="$style.title">Сегодняшние задачи</h2>
                <p :class="$style.subtitle">{{ todayLabel }}</p>
            </div>

            <div :class="$style.gridControls">
                <span :class="$style.gridLabel">Колонки</span>
                <button
                    v-for="n in [1, 2, 3, 4]"
                    :key="n"
                    type="button"
                    :class="[$style.gridButton, columns === n && $style.gridButtonActive]"
                    @click="setColumns(n)"
                >
                    {{ n }}
                </button>
            </div>
        </header>

        <div v-if="tasksQuery.isLoading.value" :class="$style.loading">
            <p>Загружаем задачи…</p>
        </div>

        <div v-else-if="tasks.length === 0" :class="$style.empty">
            <p>На сегодня задач нет 🎉</p>
        </div>

        <TaskList
            v-else
            :tasks="tasks"
            :show-subtasks="showSubtasks"
            :telegram-enabled="isTelegramEnabled"
            :columns="columns"
            compact
            @task-toggle="handleTaskToggle"
            @progress-update="handleProgressUpdate"
            @series-complete="handleSeriesComplete"
        />
    </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import TaskList from '@/views/TaskDashboard/components/TaskList.vue'
import { TaskService } from '@/shared/services/task/task.service'
import type {
    IReqGETTasksAll,
    ITask,
    ITaskSchedule,
    ITaskStatus,
} from '@/shared/services/task/task.types'
import type { Task } from '@/views/TaskDashboard/types'
import { UserService } from '@/shared/services/user/User.service'

const props = defineProps<{
    dateFilter?: 'all' | 'today'
    showSubtasks?: boolean
}>()

const showSubtasks = computed(() => props.showSubtasks ?? true)

const columns = ref(1)

onMounted(() => {
    const stored = window.localStorage.getItem('homeTasksColumns')
    const parsed = stored ? Number(stored) : NaN
    if (parsed >= 1 && parsed <= 4) {
        columns.value = parsed
    }
})

function setColumns(n: number) {
    columns.value = n
    window.localStorage.setItem('homeTasksColumns', String(n))
}

const todayLabel = computed(() => {
    const today = new Date()
    return today.toLocaleDateString('ru-RU', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })
})

const WEEK_DAYS_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function computeNextRunForSchedule(schedule: ITaskSchedule, now: Date): Date | null {
    if (!schedule) return null

    const startDate = schedule.runAt ? new Date(schedule.runAt) : null
    if (startDate && isNaN(startDate.getTime())) return null

    const [hours, minutes] = (schedule.timeOfDay ?? '')
        .split(':')
        .map((v: string) => Number(v || 0))

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
                  current: 0,
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

function buildTodayParams(): IReqGETTasksAll {
    const params: IReqGETTasksAll = {}

    // по умолчанию показываем задачи за сегодня
    if (props.dateFilter === 'today' || !props.dateFilter) {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)
        params.startDate = start.toISOString()
        params.endDate = end.toISOString()
    }

    return params
}

const tasksQuery = useQuery({
    queryKey: ['todayTasks'],
    queryFn: () => TaskService.allTasks(buildTodayParams()),
})

const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => UserService.getMe(),
})

const tasks = computed(() => {
    const rawTasks = tasksQuery.data.value?.items || []
    return rawTasks
        .filter((task) => task.parentId === null || task.parentId === undefined)
        .map(mapTask)
})

const isTelegramEnabled = computed(() => {
    return Boolean(meQuery.data.value?.telegramEnabled)
})

const updateTaskMutation = useMutation({
    mutationKey: ['updateTask'],
    mutationFn: async (data: { taskId: number; checked: boolean }) => {
        const task = tasks.value.find((t) => t.id === data.taskId)

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
    },
})

const updateProgressMutation = useMutation({
    mutationKey: ['updateProgress'],
    mutationFn: async (data: { taskId: number; value: number; instanceId?: number }) => {
        const task = tasks.value.find((t) => t.id === data.taskId)

        const currentTotal = (() => {
            if (data.instanceId && task?.currentInstance) {
                if (typeof task.currentInstance.progressTotal === 'number') {
                    return task.currentInstance.progressTotal
                }
                return task.currentInstance.progressEntries?.reduce((sum, e) => sum + e.amount, 0) ?? 0
            }
            return task?.progressEntries?.reduce((sum, e) => sum + e.amount, 0) ?? 0
        })()

        await TaskService.addProgressEntry({
            taskId: data.taskId,
            dto: {
                amount: data.value - currentTotal,
                taskInstanceId: data.instanceId,
            },
        })
    },
    onSuccess: () => {
        tasksQuery.refetch()
    },
})

function handleTaskToggle(payload: { taskId: number; checked: boolean }) {
    updateTaskMutation.mutate(payload)
}

function handleProgressUpdate(payload: { taskId: number; value: number; instanceId?: number }) {
    updateProgressMutation.mutate(payload)
}

function handleSeriesComplete(payload: { taskId: number }) {
    completeScheduledTaskMutation.mutate(payload)
}
</script>

<style module>
.wrapper {
    padding: 12px 16px;
}

.header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 16px;
}

.gridControls {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(20, 20, 20, 0.9);
    border: 1px solid rgba(55, 65, 81, 0.7);
}

.gridLabel {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9ca3af;
}

.gridButton {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: #9ca3af;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.gridButton:hover {
    background: rgba(55, 65, 81, 0.7);
    color: #e5e7eb;
}

.gridButtonActive {
    background: #6366f1;
    color: #f9fafb;
}

.title {
    font-size: 20px;
    font-weight: 600;
}

.subtitle {
    margin-top: 4px;
    font-size: 13px;
    color: #888;
}

.loading,
.empty {
    padding: 16px 0;
    color: #aaa;
    font-size: 14px;
}
</style>
