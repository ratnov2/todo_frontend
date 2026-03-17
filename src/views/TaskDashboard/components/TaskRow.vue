<template>
    <div :class="$style.wrapper">
        <!-- Hierarchy guide line -->
        <div
            v-if="level > 0"
            :class="$style.guide"
            :style="{ left: `${(level - 1) * 32 + 20}px` }"
        />

        <div
            :class="[
                $style.card,
                level > 0 && $style.nested,
                isScheduledTask && $style.scheduledCard,
                isInstanceCompleted && $style.completedCard,
            ]"
            :style="{ paddingLeft: `${level * 32}px` }"
        >
            <div :class="$style.content">
                <div :class="$style.row">
                    <!-- Expand / Collapse -->
                    <div v-if="hasSubtasks && showSubtasks" :class="$style.expand">
                        <button :class="$style.expandButton" @click="isExpanded = !isExpanded">
                            <IconChevronRight :size="16" :class="[isExpanded && $style.rotated]" />
                        </button>
                    </div>

                    <!-- Task content -->
                    <div :class="$style.body">
                        <div :class="$style.header">
                            <!-- Checkbox inside header -->
                            <input
                                :class="[
                                    $style.checkbox,
                                    isScheduledTask && $style.checkboxScheduled,
                                ]"
                                type="checkbox"
                                :checked="isInstanceCompleted"
                                :title="checkboxTitle"
                                @click="toggleCheckbox"
                            />

                            <div :class="$style.headerMain">
                                <div v-if="isScheduledTask" :class="$style.recurringBadge">
                                    <span :class="$style.recurringDot" />
                                    <span>Повторяющаяся задача</span>
                                </div>
                                <h3
                                    :class="[
                                        $style.title,
                                        isTaskCompleted && $style.done,
                                        isInstanceCompleted &&
                                            !isTaskCompleted &&
                                            $style.instanceDone,
                                    ]"
                                >
                                    {{ task.title }}
                                </h3>
                                <span v-if="hasSubtasks" :class="$style.subtasksBadge">
                                    {{ task.nestedSubtasksCount ?? 0 }}
                                </span>
                                <PriorityIndicator
                                    v-if="task.priority !== undefined"
                                    :priority="task.priority"
                                />
                            </div>
                        </div>

                        <div :class="$style.meta">
                            <TypeBadge v-if="task.type" :type="task.type" />
                            <StatusBadge :status="task.status" />

                            <div v-if="task.nextRun" :class="$style.date">
                                <IconClock :size="14" />
                                <span>Next: {{ formatDate(task.nextRun) }}</span>
                            </div>

                            <div
                                v-if="
                                    task.type === 'SCHEDULED' &&
                                    task.nextRun &&
                                    scheduleTimeRemaining.total > 0
                                "
                                :class="$style.scheduleMeta"
                            >
                                <div :class="$style.scheduleTimer">
                                    <span v-if="task.scheduleInfo" :class="$style.schedulePattern">
                                        {{ task.scheduleInfo }}
                                    </span>
                                    <span :class="$style.scheduleLabel">через</span>
                                    <span :class="$style.scheduleCountdown">
                                        {{ scheduleTimeRemaining.days }}д
                                        {{ scheduleTimeRemaining.hours }}ч
                                        {{ scheduleTimeRemaining.minutes }}м
                                    </span>
                                </div>

                                <div
                                    v-if="telegramEnabled"
                                    :class="$style.telegramBadge"
                                    title="Notifications via Telegram"
                                >
                                    <IconBrandTelegram :size="14" />
                                    <span>Telegram</span>
                                </div>
                            </div>

                            <div v-if="task.scheduledFor" :class="$style.date">
                                <IconCalendar :size="14" />
                                <span>Due: {{ formatDate(task.scheduledFor) }}</span>
                            </div>
                            <div
                                v-if="task.type === 'SCHEDULED' && task.currentInstance"
                                :class="$style.instanceMeta"
                            ></div>
                        </div>

                        <!-- Task Instance Stats -->
                        <Transition name="stats-panel">
                            <div v-if="showStats" :class="$style.statsPanel">
                                <div v-if="statsLoading" :class="$style.statsLoading">
                                    <div :class="$style.statsSpinner" />
                                    <span>Загружаем статистику…</span>
                                </div>
                                <div v-else-if="statsError" :class="$style.statsError">
                                    <IconAlertCircle :size="16" />
                                    <span>Не удалось загрузить</span>
                                </div>
                                <div v-else-if="taskStats" :class="$style.statsGrid">
                                    <div :class="[$style.statItem, $style.statDone]">
                                        <div :class="$style.statIcon">
                                            <IconCircleCheck :size="18" />
                                        </div>
                                        <div :class="$style.statInfo">
                                            <span :class="$style.statValue">{{
                                                taskStats.done
                                            }}</span>
                                            <span :class="$style.statLabel">Выполнено</span>
                                        </div>
                                    </div>
                                    <div :class="[$style.statItem, $style.statFailed]">
                                        <div :class="$style.statIcon">
                                            <IconCircleX :size="18" />
                                        </div>
                                        <div :class="$style.statInfo">
                                            <span :class="$style.statValue">{{
                                                taskStats.failed
                                            }}</span>
                                            <span :class="$style.statLabel">Провалено</span>
                                        </div>
                                    </div>
                                    <div :class="[$style.statItem, $style.statMissed]">
                                        <div :class="$style.statIcon">
                                            <IconClockOff :size="18" />
                                        </div>
                                        <div :class="$style.statInfo">
                                            <span :class="$style.statValue">{{
                                                taskStats.missed
                                            }}</span>
                                            <span :class="$style.statLabel">Пропущено</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>

                        <!-- Deadline Section -->
                        <div
                            v-if="task.type === 'DEADLINE' && task.scheduledFor"
                            :class="[$style.deadlineSection, $style[deadlineStatusClass]]"
                        >
                            <div :class="$style.deadlineCard">
                                <div :class="$style.deadlineHeader">
                                    <div :class="$style.deadlineInfo">
                                        <IconCalendar :size="18" />
                                        <div :class="$style.deadlineText">
                                            <span :class="$style.deadlineLabel">Deadline</span>
                                            <span :class="$style.deadlineDate">{{
                                                formatDeadlineDate(task.scheduledFor)
                                            }}</span>
                                        </div>
                                    </div>
                                    <div :class="[$style.deadlineStatus, deadlineStatusClass]">
                                        <span v-if="isOverdue" :class="$style.overdueBadge"
                                            >Overdue</span
                                        >
                                        <span v-else-if="isUrgent" :class="$style.urgentBadge"
                                            >Urgent</span
                                        >
                                        <span
                                            v-else-if="isApproaching"
                                            :class="$style.approachingBadge"
                                            >Soon</span
                                        >
                                    </div>
                                </div>

                                <div v-if="!isOverdue" :class="$style.countdown">
                                    <div :class="$style.countdownItem">
                                        <span :class="$style.countdownValue">{{
                                            timeRemaining.days
                                        }}</span>
                                        <span :class="$style.countdownLabel">days</span>
                                    </div>
                                    <span :class="$style.countdownSeparator">:</span>
                                    <div :class="$style.countdownItem">
                                        <span :class="$style.countdownValue">{{
                                            timeRemaining.hours
                                        }}</span>
                                        <span :class="$style.countdownLabel">hours</span>
                                    </div>
                                    <span :class="$style.countdownSeparator">:</span>
                                    <div :class="$style.countdownItem">
                                        <span :class="$style.countdownValue">{{
                                            timeRemaining.minutes
                                        }}</span>
                                        <span :class="$style.countdownLabel">min</span>
                                    </div>
                                    <span :class="$style.countdownSeparator">:</span>
                                    <div :class="$style.countdownItem">
                                        <span :class="$style.countdownValue">{{
                                            timeRemaining.seconds
                                        }}</span>
                                        <span :class="$style.countdownLabel">sec</span>
                                    </div>
                                </div>

                                <div v-else :class="$style.overdueMessage">
                                    <span :class="$style.overdueText"
                                        >This task is overdue by {{ overdueTime }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Progress Meta Section -->
                        <div v-if="task.progressMeta" :class="$style.progressSection">
                            <div :class="$style.progressMetaCard">
                                <div :class="$style.progressHeader">
                                    <div :class="$style.progressInfo">
                                        <span :class="$style.progressLabel">Progress</span>
                                        <div :class="$style.progressMainRow">
                                            <span
                                                :class="[
                                                    $style.progressValue,
                                                    isOverTarget && $style.progressValueOver,
                                                ]"
                                            >
                                                {{ currentProgress }}
                                            </span>
                                            <span :class="$style.progressSeparator">/</span>
                                            <span :class="$style.progressTarget">
                                                {{ task.progressMeta.targetValue }}
                                                {{ task.progressMeta.unit }}
                                            </span>
                                            <span
                                                v-if="task.progressMeta.targetValue"
                                                :class="[
                                                    $style.multiplierBadge,
                                                    isOverTarget && $style.multiplierOver,
                                                ]"
                                            >
                                                ×{{ progressMultiplier.toFixed(1) }}
                                            </span>
                                        </div>
                                    </div>
                                    <div :class="$style.progressMeta">
                                        <span :class="$style.metaBadge">{{
                                            task.progressMeta.aggregation
                                        }}</span>
                                        <span :class="$style.metaBadge">{{
                                            task.progressMeta.isCumulative ? 'Cumulative' : 'Single'
                                        }}</span>
                                    </div>
                                </div>

                                <!-- Progress Bar -->
                                <div :class="$style.progressBarContainer">
                                    <div
                                        :class="$style.progressBarFill"
                                        :style="{ width: `${progressPercentage}%` }"
                                    ></div>
                                </div>

                                <!-- Add Progress Controls -->
                                <div :class="$style.addProgressControls">
                                    <div :class="$style.addProgressButtons">
                                        <button
                                            :class="$style.addButton"
                                            @click="handleAddProgress(1)"
                                            :disabled="isAddingProgress"
                                        >
                                            <IconPlus :size="14" />
                                            <span>+1</span>
                                        </button>
                                        <button
                                            :class="$style.addButton"
                                            @click="handleAddProgress(5)"
                                            :disabled="isAddingProgress"
                                        >
                                            <IconPlus :size="14" />
                                            <span>+5</span>
                                        </button>
                                        <button
                                            :class="$style.addButton"
                                            @click="handleAddProgress(10)"
                                            :disabled="isAddingProgress"
                                        >
                                            <IconPlus :size="14" />
                                            <span>+10</span>
                                        </button>
                                    </div>
                                    <div :class="$style.customProgress">
                                        <input
                                            v-model.number="customAmount"
                                            type="number"
                                            :class="$style.customInput"
                                            placeholder="+ / -"
                                        />
                                        <button
                                            :class="$style.addButton"
                                            @click="handleAddCustomProgress"
                                            :disabled="
                                                isAddingProgress ||
                                                customAmount === null ||
                                                customAmount === 0
                                            "
                                        >
                                            <IconPlus :size="14" />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Progress Entries -->
                            <div
                                v-if="progressEntriesSource.length > 0"
                                :class="$style.progressEntries"
                            >
                                <div
                                    v-for="entry in progressEntriesSource.slice().reverse()"
                                    :key="entry.id"
                                    :class="$style.progressEntry"
                                >
                                    <div :class="$style.entryHeader">
                                        <span :class="$style.entryAmount"
                                            >+{{ entry.amount }} {{ task.progressMeta.unit }}</span
                                        >
                                        <span :class="$style.entryDate">{{
                                            formatEntryDate(entry.createdAt)
                                        }}</span>
                                    </div>
                                    <p v-if="entry.note" :class="$style.entryNote">
                                        {{ entry.note }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div :class="$style.footer">
                            <span>Created {{ formatDate(task.createdAt) }}</span>
                            <div :class="$style.footerActions">
                                <button
                                    v-if="!!task.currentInstance"
                                    :class="[
                                        $style.statsButton,
                                        showStats && $style.statsButtonActive,
                                    ]"
                                    @click="toggleStats"
                                    :title="showStats ? 'Скрыть статистику' : 'Показать статистику'"
                                >
                                    <IconChartBar :size="14" />
                                    <span>Статистика</span>
                                </button>
                                <button
                                    v-if="isScheduledTask && !!task.currentInstance"
                                    :class="$style.seriesButton"
                                    type="button"
                                    @click="onSeriesCompleteClick"
                                    title="Завершить задачу и все её инстансы"
                                >
                                    <IconAlertTriangle :size="14" />
                                    <span>Завершить задачу</span>
                                </button>
                                <button
                                    v-if="task.status !== 'cancelled'"
                                    :class="$style.cancelButton"
                                    type="button"
                                    @click="handleCancel"
                                    title="Отменить задачу"
                                >
                                    <IconCircleX :size="14" />
                                </button>
                                <button :class="$style.editButton" @click="handleEdit">
                                    <IconEdit :size="14" />
                                    <span>Edit</span>
                                </button>
                            </div>
                        </div>

                        <!-- Scheduled task complete confirm -->
                        <Transition name="series-confirm">
                            <div v-if="showSeriesConfirm" :class="$style.seriesConfirm">
                                <div :class="$style.seriesConfirmText">
                                    <span :class="$style.seriesConfirmTitle">
                                        Завершить задачу целиком?
                                    </span>
                                    <span :class="$style.seriesConfirmSubtitle">
                                        Будут считаться завершёнными все будущие инстансы этой
                                        задачи. Текущая серия больше не будет генерироваться.
                                    </span>
                                </div>
                                <div :class="$style.seriesConfirmActions">
                                    <button
                                        type="button"
                                        :class="$style.seriesCancelButton"
                                        @click="cancelSeriesComplete"
                                    >
                                        Отменить
                                    </button>
                                    <button
                                        type="button"
                                        :class="$style.seriesDangerButton"
                                        @click="confirmSeriesComplete"
                                    >
                                        Да, завершить задачу
                                    </button>
                                </div>
                            </div>
                        </Transition>

                        <!-- Cancel task confirm -->
                        <Transition name="series-confirm">
                            <div
                                v-if="showCancelConfirm"
                                :class="[$style.seriesConfirm, $style.cancelConfirm]"
                            >
                                <div :class="$style.seriesConfirmText">
                                    <span :class="$style.seriesConfirmTitle">
                                        Отменить эту задачу?
                                    </span>
                                    <span :class="$style.seriesConfirmSubtitle">
                                        Задача будет помечена как отменённая (cancelled) и больше не
                                        будет учитываться в активных.
                                    </span>
                                </div>
                                <div :class="$style.seriesConfirmActions">
                                    <button
                                        type="button"
                                        :class="$style.seriesCancelButton"
                                        @click="cancelCancel"
                                    >
                                        Оставить как есть
                                    </button>
                                    <button
                                        type="button"
                                        :class="$style.seriesDangerButton"
                                        @click="confirmCancel"
                                    >
                                        Да, отменить задачу
                                    </button>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subtasks -->
        <Transition name="subtask">
            <div v-if="hasSubtasks && showSubtasks && isExpanded" :class="$style.subtasks">
                <TaskRow
                    v-for="subtask in task.subtasks"
                    :key="subtask.id"
                    :task="subtask"
                    :show-subtasks="showSubtasks"
                    :level="level + 1"
                    @task-toggle="$emit('task-toggle', $event)"
                    @progress-update="$emit('progress-update', $event)"
                    @cancel-task="$emit('cancel-task', $event)"
                />
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    IconChevronRight,
    IconClock,
    IconCalendar,
    IconPlus,
    IconEdit,
    IconBrandTelegram,
    IconChartBar,
    IconCircleCheck,
    IconCircleX,
    IconClockOff,
    IconAlertCircle,
    IconAlertTriangle,
} from '@tabler/icons-vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import TypeBadge from '@/components/ui/TypeBadge.vue'
import PriorityIndicator from './PriorityIndicator.vue'
import type { Task } from '../types'
import { TaskService } from '@/shared/services/task/task.service'
import type { IResGETTaskInstanceStats } from '@/shared/services/task/task.types'

const router = useRouter()

const props = defineProps<{
    task: Task
    showSubtasks: boolean
    level: number
    telegramEnabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'task-toggle', payload: { taskId: number; checked: boolean }): void
    (e: 'progress-update', payload: { taskId: number; value: number; instanceId?: number }): void
    (e: 'series-complete', payload: { taskId: number }): void
    (e: 'cancel-task', payload: { taskId: number }): void
}>()

const isExpanded = ref(false)
const isAddingProgress = ref(false)
const customAmount = ref<number | null>(null)
const currentTime = ref(new Date())
const showStats = ref(false)
const statsLoading = ref(false)
const statsError = ref(false)
const taskStats = ref<IResGETTaskInstanceStats | null>(null)
const showSeriesConfirm = ref(false)
const showCancelConfirm = ref(false)

let timerInterval: number | null = null

// Update current time every second for countdown
onMounted(() => {
    if (
        (props.task.type === 'DEADLINE' && props.task.scheduledFor) ||
        (props.task.type === 'SCHEDULED' && props.task.nextRun)
    ) {
        timerInterval = window.setInterval(() => {
            currentTime.value = new Date()
        }, 1000)
    }
})

onUnmounted(() => {
    if (timerInterval) {
        clearInterval(timerInterval)
    }
})

const hasSubtasks = computed(() => props.task.subtasks && props.task.subtasks.length > 0)

const isScheduledTask = computed(() => props.task.type === 'SCHEDULED')

const isTaskCompleted = computed(() => props.task.completed || props.task.status === 'done')

const isInstanceCompleted = computed(() => {
    if (props.task.type === 'SCHEDULED' && props.task.currentInstance) {
        return props.task.currentInstance.status === 'done'
    }
    return isTaskCompleted.value
})

const checkboxTitle = computed(() => {
    if (props.task.type === 'SCHEDULED' && props.task.currentInstance) {
        return 'Отметить текущую итерацию выполненной'
    }
    return 'Отметить задачу выполненной'
})

const toggleCheckbox = (e: Event) => {
    e.preventDefault()

    emit('task-toggle', { taskId: props.task.id, checked: !isInstanceCompleted.value })
}

// const taskProgress = computed(() => {
//     if (typeof props.task.progress === 'object' && props.task.progress !== null) {
//         return props.task.progress
//     }
//     return null
// })

const progressEntriesSource = computed(() => {
    // If currentInstance exists, progress is scoped to the instance
    if (props.task.currentInstance?.progressEntries) {
        return props.task.currentInstance.progressEntries
    }
    return props.task.progressEntries ?? []
})

// Calculate current progress
const currentProgress = computed(() => {
    // Prefer server-calculated total for instance (if present)
    if (props.task.currentInstance && typeof props.task.currentInstance.progressTotal === 'number') {
        return props.task.currentInstance.progressTotal
    }
    if (progressEntriesSource.value.length === 0) {
        return 0
    }
    return progressEntriesSource.value.reduce((sum, entry) => sum + entry.amount, 0)
})

// Calculate progress percentage
const progressPercentage = computed(() => {
    if (!props.task.progressMeta) return 0
    if (props.task.progressMeta.targetValue === 0) return 0
    return Math.min((currentProgress.value / props.task.progressMeta.targetValue) * 100, 100)
})

const progressMultiplier = computed(() => {
    if (!props.task.progressMeta || !props.task.progressMeta.targetValue) return 0
    return currentProgress.value / props.task.progressMeta.targetValue
})

const isOverTarget = computed(() => progressMultiplier.value >= 1)

function handleAddProgress(amount: number) {
    if (!props.task.progressMeta) return

    isAddingProgress.value = true

    const newValue = currentProgress.value + amount

    emit('progress-update', {
        taskId: props.task.id,
        value: newValue,
        instanceId: props.task.currentInstance?.id,
    })

    // Reset loading state after a short delay
    setTimeout(() => {
        isAddingProgress.value = false
    }, 500)
}

function handleAddCustomProgress() {
    if (customAmount.value === null || customAmount.value === 0) return
    handleAddProgress(customAmount.value)
    customAmount.value = null
}

async function toggleStats() {
    showStats.value = !showStats.value

    if (showStats.value && taskStats.value === null && !statsLoading.value) {
        statsLoading.value = true
        statsError.value = false
        try {
            taskStats.value = await TaskService.getTaskStats(props.task.id)
        } catch (e) {
            console.error('Failed to load task stats', e)
            statsError.value = true
            showStats.value = false
        } finally {
            statsLoading.value = false
        }
    }
}

function onSeriesCompleteClick() {
    if (!isScheduledTask.value) return
    showSeriesConfirm.value = !showSeriesConfirm.value
}

function cancelSeriesComplete() {
    showSeriesConfirm.value = false
}

function confirmSeriesComplete() {
    emit('series-complete', { taskId: props.task.id })
    showSeriesConfirm.value = false
}

function handleCancel() {
    showCancelConfirm.value = true
}

function cancelCancel() {
    showCancelConfirm.value = false
}

function confirmCancel() {
    emit('cancel-task', { taskId: props.task.id })
    showCancelConfirm.value = false
}

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function formatEntryDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Deadline calculations
const deadlineDate = computed(() => {
    if (!props.task.scheduledFor) return null
    return new Date(props.task.scheduledFor)
})

// Schedule (next run) calculations for SCHEDULED tasks
const nextRunDate = computed(() => {
    if (!props.task.nextRun) return null
    return new Date(props.task.nextRun)
})

const scheduleTimeRemaining = computed(() => {
    if (!nextRunDate.value) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    const now = currentTime.value
    const target = nextRunDate.value
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, total: diff }
})

const timeRemaining = computed(() => {
    if (!deadlineDate.value) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    const now = currentTime.value
    const deadline = deadlineDate.value
    const diff = deadline.getTime() - now.getTime()

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, total: diff }
})

const isOverdue = computed(() => {
    if (!deadlineDate.value) return false
    return currentTime.value > deadlineDate.value
})

const isUrgent = computed(() => {
    if (!deadlineDate.value || isOverdue.value) return false
    const hoursRemaining = timeRemaining.value.total / (1000 * 60 * 60)
    return hoursRemaining <= 24 && hoursRemaining > 0
})

const isApproaching = computed(() => {
    if (!deadlineDate.value || isOverdue.value || isUrgent.value) return false
    const daysRemaining = timeRemaining.value.total / (1000 * 60 * 60 * 24)
    return daysRemaining <= 3 && daysRemaining > 0
})

const deadlineStatusClass = computed(() => {
    if (isOverdue.value) return 'overdue'
    if (isUrgent.value) return 'urgent'
    if (isApproaching.value) return 'approaching'
    return 'normal'
})

const overdueTime = computed(() => {
    if (!deadlineDate.value || !isOverdue.value) return ''

    const now = currentTime.value
    const deadline = deadlineDate.value
    const diff = now.getTime() - deadline.getTime()

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`
    } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`
    }
})

function formatDeadlineDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function handleEdit() {
    router.push(`/editTask/${props.task.id}`)
}
</script>

<style module>
.wrapper {
    position: relative;
}

.guide {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(99, 102, 241, 0.3) 20%,
        rgba(99, 102, 241, 0.3) 80%,
        transparent 100%
    );
    z-index: 0;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.2);
}

.card {
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(24, 24, 24, 0.9) 100%);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 12px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, rgba(31, 31, 31, 0.95) 0%, rgba(28, 28, 28, 0.95) 100%);
    transform: translateY(-2px);
    box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(99, 102, 241, 0.2),
        0 4px 16px rgba(99, 102, 241, 0.15);
}

.completedCard {
    background: linear-gradient(135deg, #050505 0%, #050505 100%);
    border-color: rgba(60, 60, 60, 0.9);
    box-shadow: none;
    filter: grayscale(0.9);
    opacity: 0.85;
}

.completedCard:hover {
    border-color: rgba(60, 60, 60, 1);
    background: linear-gradient(135deg, #050505 0%, #050505 100%);
    transform: none;
    box-shadow: none;
}

/* Keep progress section vivid for completed tasks */
.completedCard .progressSection,
.completedCard .progressMetaCard,
.completedCard .progressBarFill,
.completedCard .addButton,
.completedCard .customInput,
.completedCard .progressValue,
.completedCard .multiplierBadge {
    filter: none;
    opacity: 1;
}

.card:hover::before {
    opacity: 1;
}

.nested {
    opacity: 0.92;
    background: linear-gradient(135deg, rgba(24, 24, 24, 0.9) 0%, rgba(22, 22, 22, 0.9) 100%);
}

.scheduledCard {
    border-color: rgba(59, 130, 246, 0.7);
    box-shadow:
        0 0 0 1px rgba(37, 99, 235, 0.35),
        0 10px 30px rgba(15, 23, 42, 0.8);
}

.scheduledCard:hover {
    border-color: rgba(96, 165, 250, 0.9);
}

.content {
    padding: 16px;
}

.row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.expand {
    width: 24px;
    flex-shrink: 0;
}

.expandButton {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
    position: relative;
}

.expandButton::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.1);
    opacity: 0;
    transition: opacity 0.3s;
}

.expandButton:hover {
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
    transform: scale(1.1);
}

.expandButton:hover::before {
    opacity: 1;
}

.rotated {
    transform: rotate(90deg);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: #6366f1;
    flex-shrink: 0;
    transition: transform 0.2s;
}

.checkbox:hover {
    transform: scale(1.1);
}

.checkboxScheduled {
    accent-color: #60a5fa;
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.6);
}

.body {
    flex: 1;
    min-width: 0;
}

.header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
}

.headerMain {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

.recurringBadge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(59, 130, 246, 0.6);
    color: #bfdbfe;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.recurringDot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #38bdf8;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.9);
}

.title {
    font-size: 15px;
    font-weight: 500;
    color: #f5f5f5;
    flex: 1;
    margin: 0;
    line-height: 1.5;
    transition: all 0.3s;
    letter-spacing: -0.01em;
}

.title:hover {
    color: #fff;
    text-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
}

.subtasksBadge {
    padding: 4px 8px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    color: #a5b4fc;
    line-height: 1;
    flex-shrink: 0;
}

.done {
    text-decoration: line-through;
    color: #a1a1a1;
    opacity: 0.9;
}

.instanceDone {
    color: #a5b4fc;
    opacity: 0.9;
}

.meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
    transition: all 0.3s;
    padding: 4px 8px;
    border-radius: 6px;
}

.date:hover {
    color: #a5b4fc;
    background: rgba(99, 102, 241, 0.1);
}

.scheduleMeta {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(20, 20, 20, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.scheduleTimer {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #c7d2fe;
}

.schedulePattern {
    font-weight: 500;
}

.scheduleLabel {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.8;
}

.scheduleCountdown {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.telegramBadge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(37, 37, 37, 0.9);
    border: 1px solid rgba(59, 130, 246, 0.6);
    color: #bfdbfe;
    font-size: 11px;
}

.progress {
    margin-top: 12px;
    margin-bottom: 8px;
}

.progressSection {
    margin-top: 12px;
    margin-bottom: 8px;
}

.progressMetaCard {
    background: rgba(20, 20, 20, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 10px;
    padding: 14px;
    transition: all 0.3s ease;
}

.progressMetaCard:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: rgba(25, 25, 25, 0.8);
}

.progressHeader {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.progressInfo {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.progressLabel {
    font-size: 11px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.progressValue {
    font-size: 20px;
    font-weight: 800;
    color: #e5e7eb;
    font-variant-numeric: tabular-nums;
}

.progressValueOver {
    background: linear-gradient(120deg, #4ade80, #22c55e, #a3e635);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
}

.progressMainRow {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-wrap: wrap;
}

.progressSeparator {
    font-size: 16px;
    color: #9ca3af;
}

.progressTarget {
    font-size: 14px;
    color: #9ca3af;
}

.multiplierBadge {
    margin-left: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.18);
    border: 1px solid rgba(59, 130, 246, 0.6);
    font-size: 11px;
    font-weight: 600;
    color: #bfdbfe;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.multiplierOver {
    background: rgba(22, 163, 74, 0.18);
    border-color: rgba(34, 197, 94, 0.8);
    color: #bbf7d0;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
}

.progressMeta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.metaBadge {
    padding: 4px 8px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 6px;
    font-size: 10px;
    color: #a5b4fc;
    text-transform: capitalize;
    font-weight: 500;
}

.progressBarContainer {
    height: 10px;
    background: rgba(37, 37, 37, 0.8);
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    margin-bottom: 12px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progressBarFill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    border-radius: 5px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow:
        0 0 12px rgba(99, 102, 241, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.addProgressButtons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.addButton {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(37, 37, 37, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    color: #a5b4fc;
    font-size: 13px;
    font-weight: 600;
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

.addButton:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.5);
    color: #c7d2fe;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.addButton:hover:not(:disabled)::before {
    opacity: 1;
}

.addButton:active:not(:disabled) {
    transform: translateY(0);
}

.addButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.addProgressControls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.customProgress {
    display: flex;
    gap: 8px;
    align-items: center;
}

.customInput {
    width: 80px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgba(42, 42, 42, 0.8);
    background: rgba(15, 15, 15, 0.9);
    color: #f5f5f5;
    font-size: 13px;
    outline: none;
    transition: all 0.2s ease;
}

.customInput:focus {
    border-color: rgba(99, 102, 241, 0.7);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4);
}

.progressEntries {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 4px;
}

.progressEntries::-webkit-scrollbar {
    width: 4px;
}

.progressEntries::-webkit-scrollbar-track {
    background: rgba(37, 37, 37, 0.5);
    border-radius: 2px;
}

.progressEntries::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.5);
    border-radius: 2px;
}

.progressEntry {
    background: rgba(15, 15, 15, 0.6);
    border: 1px solid rgba(42, 42, 42, 0.4);
    border-radius: 8px;
    padding: 10px 12px;
    transition: all 0.2s ease;
}

.progressEntry:hover {
    background: rgba(20, 20, 20, 0.8);
    border-color: rgba(99, 102, 241, 0.2);
}

.entryHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.entryAmount {
    font-size: 14px;
    font-weight: 600;
    color: #a5b4fc;
}

.entryDate {
    font-size: 11px;
    color: #777;
}

.entryNote {
    font-size: 12px;
    color: #999;
    margin: 0;
    font-style: italic;
}

.deadlineSection {
    margin-top: 12px;
    margin-bottom: 8px;
}

.deadlineCard {
    background: rgba(20, 20, 20, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 10px;
    padding: 14px;
    transition: all 0.3s ease;
}

.normal .deadlineCard {
    border-color: rgba(99, 102, 241, 0.2);
    background: rgba(20, 20, 20, 0.6);
}

.approaching .deadlineCard {
    border-color: rgba(251, 191, 36, 0.4);
    background: rgba(30, 25, 15, 0.6);
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.15);
}

.urgent .deadlineCard {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(30, 15, 15, 0.6);
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.2);
    animation: pulse 2s ease-in-out infinite;
}

.overdue .deadlineCard {
    border-color: rgba(220, 38, 38, 0.6);
    background: rgba(30, 10, 10, 0.7);
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}

@keyframes pulse {
    0%,
    100% {
        box-shadow: 0 0 16px rgba(239, 68, 68, 0.2);
    }
    50% {
        box-shadow: 0 0 24px rgba(239, 68, 68, 0.4);
    }
}

.deadlineHeader {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.deadlineInfo {
    display: flex;
    align-items: center;
    gap: 10px;
}

.deadlineText {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.deadlineLabel {
    font-size: 11px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.deadlineDate {
    font-size: 14px;
    font-weight: 600;
    color: #f5f5f5;
}

.deadlineStatus {
    display: flex;
    gap: 6px;
}

.overdueBadge {
    padding: 4px 10px;
    background: rgba(220, 38, 38, 0.2);
    border: 1px solid rgba(220, 38, 38, 0.5);
    border-radius: 6px;
    font-size: 11px;
    color: #fca5a5;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.urgentBadge {
    padding: 4px 10px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 6px;
    font-size: 11px;
    color: #fca5a5;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
    animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.approachingBadge {
    padding: 4px 10px;
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.4);
    border-radius: 6px;
    font-size: 11px;
    color: #fcd34d;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.countdown {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: rgba(15, 15, 15, 0.5);
    border-radius: 8px;
}

.countdownItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 50px;
}

.countdownValue {
    font-size: 24px;
    font-weight: 700;
    color: #f5f5f5;
    font-variant-numeric: tabular-nums;
    line-height: 1;
}

.urgent .countdownValue {
    color: #fca5a5;
}

.approaching .countdownValue {
    color: #fcd34d;
}

.countdownLabel {
    font-size: 10px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.countdownSeparator {
    font-size: 20px;
    font-weight: 700;
    color: #666;
    margin: 0 -4px;
}

.overdueMessage {
    padding: 12px;
    background: rgba(220, 38, 38, 0.1);
    border-radius: 8px;
    text-align: center;
}

.overdueText {
    font-size: 14px;
    font-weight: 600;
    color: #fca5a5;
}

.footer {
    margin-top: 12px;
    font-size: 12px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 8px;
}

.footerActions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.statsButton {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(37, 37, 37, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 6px;
    color: #888;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.statsButton:hover {
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.4);
    color: #a5b4fc;
    transform: translateY(-1px);
}

.statsButtonActive {
    background: rgba(99, 102, 241, 0.18) !important;
    border-color: rgba(99, 102, 241, 0.5) !important;
    color: #c7d2fe !important;
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
}

.editButton {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(37, 37, 37, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 6px;
    color: #a5b4fc;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.editButton:hover {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.5);
    color: #c7d2fe;
    transform: translateY(-1px);
}

.subtasks {
    margin-top: 8px;
    margin-left: 32px;
}

.seriesButton {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(30, 10, 10, 0.8);
    border: 1px solid rgba(248, 113, 113, 0.4);
    border-radius: 6px;
    color: #fecaca;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.seriesButton:hover {
    background: rgba(248, 113, 113, 0.16);
    border-color: rgba(248, 113, 113, 0.7);
    color: #fee2e2;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(248, 113, 113, 0.25);
}

.seriesConfirm {
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(15, 10, 10, 0.96);
    border: 1px solid rgba(248, 113, 113, 0.5);
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-start;
}

.seriesConfirmText {
    flex: 1 1 220px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.seriesConfirmTitle {
    font-size: 13px;
    font-weight: 600;
    color: #fee2e2;
}

.seriesConfirmSubtitle {
    font-size: 11px;
    color: #fecaca;
    opacity: 0.9;
}

.seriesConfirmActions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
}

.seriesCancelButton {
    padding: 6px 10px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.5);
    color: #e5e7eb;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.seriesCancelButton:hover {
    background: rgba(148, 163, 184, 0.2);
}

.seriesDangerButton {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    background: linear-gradient(135deg, #ef4444, #f97316);
    color: #fee2e2;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
        0 4px 12px rgba(248, 113, 113, 0.4),
        0 0 0 1px rgba(127, 29, 29, 0.6);
}

.seriesDangerButton:hover {
    transform: translateY(-1px);
    box-shadow:
        0 6px 16px rgba(248, 113, 113, 0.6),
        0 0 0 1px rgba(127, 29, 29, 0.8);
}

.cancelConfirm {
    border-color: rgba(148, 163, 184, 0.6);
    background: radial-gradient(circle at 0% 0%, rgba(148, 163, 184, 0.18), rgba(15, 23, 42, 0.96));
}

.cancelConfirm .seriesConfirmTitle {
    color: #e5e7eb;
}

.cancelConfirm .seriesConfirmSubtitle {
    color: #cbd5f5;
}

.cancelConfirm .seriesDangerButton {
    background: linear-gradient(135deg, #4b5563, #ef4444);
}

.cancelButton {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: radial-gradient(circle at 0% 0%, rgba(148, 163, 184, 0.16), transparent 55%);
    color: #9ca3af;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
}

.cancelButton:hover {
    border-color: rgba(248, 113, 113, 0.7);
    background:
        radial-gradient(circle at 0% 0%, rgba(248, 113, 113, 0.18), transparent 55%),
        rgba(15, 15, 15, 0.9);
    color: #fecaca;
    box-shadow:
        0 4px 12px rgba(15, 23, 42, 0.6),
        0 0 0 1px rgba(127, 29, 29, 0.4);
    transform: translateY(-1px);
}

/* Stats Panel */
.statsPanel {
    margin-top: 12px;
    border-radius: 10px;
    border: 1px solid rgba(99, 102, 241, 0.25);
    background: rgba(15, 15, 20, 0.8);
    overflow: hidden;
    backdrop-filter: blur(8px);
}

.statsLoading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    color: #888;
    font-size: 13px;
}

.statsSpinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(99, 102, 241, 0.3);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.statsError {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    color: #f87171;
    font-size: 13px;
}

.statsGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.statItem {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    transition: background 0.2s ease;
    position: relative;
}

.statItem:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: rgba(255, 255, 255, 0.06);
}

.statItem:hover {
    background: rgba(255, 255, 255, 0.03);
}

.statIcon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.statDone .statIcon {
    background: rgba(134, 239, 172, 0.12);
    color: #86efac;
}

.statFailed .statIcon {
    background: rgba(248, 113, 113, 0.12);
    color: #f87171;
}

.statMissed .statIcon {
    background: rgba(251, 191, 36, 0.12);
    color: #fbbf24;
}

.statInfo {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.statValue {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    color: #f0f0f0;
}

.statLabel {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #777;
}
</style>

<style>
.stats-panel-enter-active,
.stats-panel-leave-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.stats-panel-enter-from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-6px);
}

.stats-panel-enter-to {
    opacity: 1;
    max-height: 200px;
    transform: translateY(0);
}

.stats-panel-leave-from {
    opacity: 1;
    max-height: 200px;
    transform: translateY(0);
}

.stats-panel-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-6px);
}

.subtask-enter-active,
.subtask-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.subtask-enter-from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px) scale(0.95);
}

.subtask-enter-to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0) scale(1);
}

.subtask-leave-from {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0) scale(1);
}

.subtask-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px) scale(0.95);
}
</style>
