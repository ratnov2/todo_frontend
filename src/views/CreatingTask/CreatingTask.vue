<template>
    <div :class="$style.container">
        <div :class="$style.header">
            <button :class="$style.closeButton" @click="handleCancel">
                <IconX :size="24" />
            </button>
            <h1 :class="$style.title">{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h1>
            <button
                :class="[$style.createButton, !isFormValid && $style.disabled]"
                @click="handleSubmit"
                :disabled="!isFormValid || isSubmitting"
            >
                {{
                    isSubmitting
                        ? isEditMode
                            ? 'Updating...'
                            : 'Creating...'
                        : isEditMode
                          ? 'Update Task'
                          : 'Create Task'
                }}
            </button>
        </div>

        <div :class="$style.content">
            <div :class="$style.formSection">
                <!-- Basic Information -->
                <div :class="$style.section">
                    <h2 :class="$style.sectionTitle">Basic Information</h2>

                    <div :class="$style.formGroup">
                        <label :class="$style.label">
                            Task Title <span :class="$style.required">*</span>
                        </label>
                        <input
                            v-model="form.title"
                            type="text"
                            :class="[$style.input, !form.title && $style.error]"
                            placeholder="Enter task title"
                            @input="validateForm"
                        />
                        <span v-if="!form.title" :class="$style.errorText">Title is required</span>
                    </div>

                    <div :class="$style.formGroup">
                        <label :class="$style.label">Description</label>
                        <textarea
                            v-model="form.description"
                            :class="$style.textarea"
                            placeholder="Enter task description (optional)"
                            rows="3"
                        />
                    </div>
                </div>

                <!-- Task Type Selection -->
                <div :class="$style.section">
                    <h2 :class="$style.sectionTitle">Task Type</h2>
                    <div :class="$style.typeSelector">
                        <button
                            v-for="type in taskTypes"
                            :key="type.value"
                            :class="[$style.typeButton, form.type === type.value && $style.active]"
                            @click="handleTypeChange(type.value as TaskType)"
                        >
                            <component :is="type.icon" :size="20" />
                            <span>{{ type.label }}</span>
                        </button>
                    </div>
                </div>

                <!-- Status and Priority -->
                <div :class="$style.section">
                    <h2 :class="$style.sectionTitle">Status & Priority</h2>

                    <div :class="$style.formRow">
                        <div :class="$style.formGroup">
                            <label :class="$style.label">Status</label>
                            <select v-model="form.status" :class="$style.select">
                                <option
                                    v-for="status in taskStatuses"
                                    :key="status"
                                    :value="status"
                                >
                                    {{ formatStatus(status) }}
                                </option>
                            </select>
                        </div>

                        <div :class="$style.formGroup">
                            <label :class="$style.label">Priority</label>
                            <input
                                v-model.number="form.priority"
                                type="number"
                                :class="$style.input"
                                min="1"
                                max="5"
                                placeholder="1-5"
                            />
                        </div>
                    </div>
                </div>

                <!-- Dynamic Fields Based on Type -->
                <div :class="$style.section">
                    <!-- ONCE Type -->
                    <template v-if="form.type === 'ONCE'">
                        <h2 :class="$style.sectionTitle">Schedule</h2>
                        <div :class="$style.formGroup">
                            <label :class="$style.label">Date & Time</label>
                            <DatePicker
                                v-model="form.scheduledFor"
                                mode="datetime"
                                placeholder="Select date and time"
                            />
                        </div>
                    </template>

                    <!-- SCHEDULED Type -->
                    <template v-if="form.type === 'SCHEDULED'">
                        <h2 :class="$style.sectionTitle">Schedule Settings</h2>

                        <div :class="$style.formGroup">
                            <label :class="$style.label"
                                >Start Date <span :class="$style.required">*</span></label
                            >
                            <DatePicker
                                :model-value="scheduledDate ? `${scheduledDate}T12:00:00` : null"
                                mode="date"
                                placeholder="Select start date"
                                :error="!schedule.runAt"
                                @update:model-value="onScheduledDateChange"
                            />
                        </div>

                        <div :class="$style.formGroup">
                            <label :class="$style.label">Time of Day</label>
                            <DatePicker
                                :model-value="scheduledTimeModelValue"
                                mode="time"
                                placeholder="Select time"
                                @update:model-value="onScheduledTimeChange"
                            />
                        </div>

                        <div :class="$style.formGroup">
                            <label :class="$style.label">Repeat Pattern</label>
                            <div :class="$style.repeatOptions">
                                <button
                                    :class="[
                                        $style.repeatButton,
                                        repeatMode === 'daysOfWeek' && $style.active,
                                    ]"
                                    @click="repeatMode = 'daysOfWeek'"
                                >
                                    Days of Week
                                </button>
                                <button
                                    :class="[
                                        $style.repeatButton,
                                        repeatMode === 'dayOfMonth' && $style.active,
                                    ]"
                                    @click="repeatMode = 'dayOfMonth'"
                                >
                                    Day of Month
                                </button>
                                <button
                                    :class="[
                                        $style.repeatButton,
                                        repeatMode === 'cron' && $style.active,
                                    ]"
                                    @click="repeatMode = 'cron'"
                                >
                                    Cron Expression
                                </button>
                            </div>
                        </div>

                        <div v-if="repeatMode === 'daysOfWeek'" :class="$style.formGroup">
                            <label :class="$style.label">Select Days</label>
                            <div :class="$style.daysSelector">
                                <button
                                    v-for="(day, index) in weekDays"
                                    :key="index"
                                    :class="[
                                        $style.dayButton,
                                        schedule.daysOfWeek?.includes(index) && $style.active,
                                    ]"
                                    @click="toggleDayOfWeek(index)"
                                >
                                    {{ day }}
                                </button>
                            </div>
                        </div>

                        <div v-if="repeatMode === 'dayOfMonth'" :class="$style.formGroup">
                            <label :class="$style.label">Day of Month (1-31)</label>
                            <input
                                v-model.number="schedule.dayOfMonth"
                                type="number"
                                :class="$style.input"
                                min="1"
                                max="31"
                                @change="updateScheduleRunAt"
                            />
                        </div>

                        <div v-if="repeatMode === 'cron'" :class="$style.formGroup">
                            <label :class="$style.label">Cron Expression</label>
                            <input
                                v-model="schedule.cronExpression"
                                type="text"
                                :class="$style.input"
                                placeholder="0 0 * * *"
                                @change="updateScheduleRunAt"
                            />
                            <span :class="$style.helpText"
                                >Example: 0 0 * * * (daily at midnight)</span
                            >
                        </div>
                    </template>

                    <!-- DEADLINE Type -->
                    <template v-if="form.type === 'DEADLINE'">
                        <h2 :class="$style.sectionTitle">Deadline</h2>

                        <div :class="$style.formGroup">
                            <label :class="$style.label"
                                >Deadline Date <span :class="$style.required">*</span></label
                            >
                            <DatePicker
                                :model-value="deadlineDate ? `${deadlineDate}T12:00:00` : null"
                                mode="date"
                                placeholder="Select deadline date"
                                :error="!deadlineDate"
                                @update:model-value="onDeadlineDateChange"
                            />
                        </div>

                        <div :class="$style.formGroup">
                            <label :class="$style.label">Time (optional)</label>
                            <DatePicker
                                :model-value="deadlineTimeModelValue"
                                mode="time"
                                placeholder="Select time"
                                @update:model-value="onDeadlineTimeChange"
                            />
                        </div>
                    </template>

                    <!-- PROGRESSIVE Settings (optional for any type) -->
                    <div :class="$style.formGroup">
                        <label :class="$style.checkboxLabel">
                            <input
                                v-model="isProgressiveEnabled"
                                type="checkbox"
                                :class="$style.checkbox"
                            />
                            <span>Add progress tracking</span>
                        </label>
                    </div>

                    <template v-if="isProgressiveEnabled">
                        <h2 :class="$style.sectionTitle">Progress Settings</h2>

                        <div :class="$style.formGroup">
                            <label :class="$style.label">
                                Target Value <span :class="$style.required">*</span>
                            </label>
                            <input
                                v-model.number="progress.targetValue"
                                type="number"
                                :class="[
                                    $style.input,
                                    (!progress.targetValue || progress.targetValue <= 0) &&
                                        $style.error,
                                ]"
                                min="1"
                                placeholder="100"
                                @input="validateForm"
                            />
                            <span
                                v-if="!progress.targetValue || progress.targetValue <= 0"
                                :class="$style.errorText"
                            >
                                Target value must be greater than 0
                            </span>
                        </div>

                        <div :class="$style.formGroup">
                            <label :class="$style.label"
                                >Unit <span :class="$style.required">*</span></label
                            >
                            <input
                                v-model="progress.unit"
                                type="text"
                                :class="[$style.input, !progress.unit && $style.error]"
                                placeholder="e.g. steps, pages, km"
                                @input="validateForm"
                            />
                        </div>

                        <div :class="$style.formGroup">
                            <label :class="$style.label"
                                >Aggregation <span :class="$style.required">*</span></label
                            >
                            <select v-model="progress.aggregation" :class="$style.select">
                                <option value="TOTAL">Total</option>
                                <option value="DAILY">Daily</option>
                                <option value="LATEST">Latest</option>
                            </select>
                        </div>

                        <div :class="$style.formGroup">
                            <label :class="$style.checkboxLabel">
                                <input
                                    v-model="progress.isCumulative"
                                    type="checkbox"
                                    :class="$style.checkbox"
                                />
                                <span>Cumulative (progress accumulates over time)</span>
                            </label>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Preview Section -->
            <div :class="$style.previewSection">
                <div :class="$style.previewCard">
                    <h3 :class="$style.previewTitle">Task Preview</h3>
                    <div :class="$style.previewContent">
                        <div :class="$style.previewItem">
                            <strong>Title:</strong> {{ form.title || 'Not set' }}
                        </div>
                        <div v-if="form.description" :class="$style.previewItem">
                            <strong>Description:</strong> {{ form.description }}
                        </div>
                        <div :class="$style.previewItem">
                            <strong>Type:</strong> {{ form.type || 'Not selected' }}
                        </div>
                        <div :class="$style.previewItem">
                            <strong>Status:</strong> {{ formatStatus(form.status) }}
                        </div>
                        <div v-if="form.priority" :class="$style.previewItem">
                            <strong>Priority:</strong> {{ form.priority }}
                        </div>

                        <template v-if="form.type === 'ONCE' && form.scheduledFor">
                            <div :class="$style.previewItem">
                                <strong>Scheduled:</strong> {{ formatDateTime(form.scheduledFor) }}
                            </div>
                        </template>

                        <template v-if="form.type === 'SCHEDULED' && schedule.runAt">
                            <div :class="$style.previewItem">
                                <strong>Start Date:</strong> {{ formatDate(schedule.runAt) }}
                            </div>
                            <div v-if="schedule.timeOfDay" :class="$style.previewItem">
                                <strong>Time:</strong> {{ schedule.timeOfDay }}
                            </div>
                            <div
                                v-if="schedule.daysOfWeek && schedule.daysOfWeek.length > 0"
                                :class="$style.previewItem"
                            >
                                <strong>Days:</strong> {{ formatDaysOfWeek(schedule.daysOfWeek) }}
                            </div>
                            <div v-if="schedule.dayOfMonth" :class="$style.previewItem">
                                <strong>Day of Month:</strong> {{ schedule.dayOfMonth }}
                            </div>
                            <div v-if="schedule.cronExpression" :class="$style.previewItem">
                                <strong>Cron:</strong> {{ schedule.cronExpression }}
                            </div>
                        </template>

                        <template v-if="form.type === 'DEADLINE' && form.scheduledFor">
                            <div :class="$style.previewItem">
                                <strong>Deadline:</strong> {{ formatDateTime(form.scheduledFor) }}
                            </div>
                        </template>

                        <template v-if="isProgressiveEnabled && progress.targetValue">
                            <div :class="$style.previewItem">
                                <strong>Target:</strong> {{ progress.targetValue }}
                                {{ progress.unit }}
                            </div>
                            <div :class="$style.previewItem">
                                <strong>Aggregation:</strong> {{ progress.aggregation }}
                            </div>
                            <div :class="$style.previewItem">
                                <strong>Cumulative:</strong>
                                {{ progress.isCumulative ? 'Yes' : 'No' }}
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { TaskService } from '@/shared/services/task/task.service'
import type {
    IReqPOSTCreateTask,
    IReqPUTUpdateTask,
    ICreateScheduleDto,
    ICreateTaskProgressDto,
    ITaskStatus,
    TaskType,
    ITask,
} from '@/shared/services/task/task.types'
import { IconX, IconCheck, IconCalendar, IconAlertCircle } from '@tabler/icons-vue'
import DatePicker from '@/components/ui/DatePicker.vue'

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.id)
const taskId = computed(() => route.params.id as string)

const taskTypes = [
    { value: 'ONCE', label: 'Once', icon: IconCheck },
    { value: 'SCHEDULED', label: 'Scheduled', icon: IconCalendar },
    { value: 'DEADLINE', label: 'Deadline', icon: IconAlertCircle },
]

const taskStatuses: ITaskStatus[] = ['pending', 'inProgress', 'done', 'cancelled']
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const form = reactive<IReqPOSTCreateTask>({
    title: '',
    description: '',
    type: 'ONCE',
    status: 'pending',
    priority: undefined,
    scheduledFor: undefined,
})

const schedule = reactive<ICreateScheduleDto>({
    type: 'SCHEDULED',
    runAt: '',
    timeOfDay: undefined,
    daysOfWeek: undefined,
    dayOfMonth: undefined,
    cronExpression: undefined,
})

const progress = reactive<ICreateTaskProgressDto>({
    targetValue: 0,
    unit: 'steps',
    aggregation: 'TOTAL',
    isCumulative: true,
})

const isProgressiveEnabled = ref(false)

const repeatMode = ref<'daysOfWeek' | 'dayOfMonth' | 'cron'>('daysOfWeek')
const scheduledDate = ref('')
const deadlineDate = ref('')
const deadlineTime = ref('')
const isSubmitting = ref(false)

const scheduledTimeModelValue = computed(() => {
    if (!schedule.timeOfDay) return null

    const [h, m] = schedule.timeOfDay.split(':').map(Number)

    const d = new Date()
    d.setHours(h ?? 0, m ?? 0, 0, 0)

    return d
})

const deadlineTimeModelValue = computed(() => {
    if (!deadlineTime.value) return null
    const [h, m] = deadlineTime.value.split(':').map(Number)
    const d = new Date()
    d.setHours(h ?? 0, m ?? 0, 0, 0)
    return d.toISOString()
})

// Watch for type changes to reset dynamic fields
watch(
    () => form.type,
    (newType) => {
        if (newType === 'SCHEDULED') {
            schedule.type = 'SCHEDULED'
            schedule.runAt = ''
            schedule.timeOfDay = undefined
            schedule.daysOfWeek = undefined
            schedule.dayOfMonth = undefined
            schedule.cronExpression = undefined
            scheduledDate.value = ''
        } else if (newType === 'DEADLINE') {
            form.scheduledFor = undefined
            deadlineDate.value = ''
            deadlineTime.value = ''
        } else if (newType === 'ONCE') {
            form.scheduledFor = undefined
        }
    }
)

const isFormValid = computed(() => {
    if (!form.title) return false

    if (form.type === 'ONCE') {
        return !!form.scheduledFor
    }

    if (form.type === 'SCHEDULED') {
        return !!schedule.runAt
    }

    if (form.type === 'DEADLINE') {
        return !!form.scheduledFor
    }

    if (isProgressiveEnabled.value) {
        return progress.targetValue > 0 && !!progress.unit && !!progress.aggregation
    }

    return true
})

// Load task data for editing
const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => TaskService.oneTask({ id: taskId.value }),
    enabled: isEditMode.value,
})

// Watch for task data and populate form
watch(
    () => taskQuery.data.value,
    (data) => {
        if (data && data.items && data.items.length > 0 && isEditMode.value) {
            const task = data.items[0] as ITask
            populateFormFromTask(task)
        }
    },
    { immediate: true }
)

const createTaskMutation = useMutation({
    mutationKey: ['createTask'],
    mutationFn: (data: IReqPOSTCreateTask) => TaskService.createTask(data),
    onSuccess: () => {
        router.push('/dashboard')
    },
    onError: (error) => {
        console.error('Error creating task:', error)
        alert('Failed to create task. Please try again.')
    },
    onSettled: () => {
        isSubmitting.value = false
    },
})

const updateTaskMutation = useMutation({
    mutationKey: ['updateTask'],
    mutationFn: (data: IReqPUTUpdateTask) => TaskService.updateTask(data),
    onSuccess: () => {
        router.push('/dashboard')
    },
    onError: (error) => {
        console.error('Error updating task:', error)
        alert('Failed to update task. Please try again.')
    },
    onSettled: () => {
        isSubmitting.value = false
    },
})

function populateFormFromTask(task: ITask) {
    form.title = task.title
    form.description = task.description || ''
    form.type = task.type || 'ONCE'
    form.status = task.status
    form.priority = task.priority

    if (task.type === 'ONCE' || task.type === 'DEADLINE') {
        if (task.scheduledFor) {
            form.scheduledFor = task.scheduledFor
            if (task.type === 'DEADLINE') {
                const date = new Date(task.scheduledFor)
                deadlineDate.value = date.toISOString().split('T')[0] || ''
                deadlineTime.value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
            }
        }
    }

    if (task.type === 'SCHEDULED' && task.schedules && task.schedules.length > 0) {
        const scheduleData = task.schedules[0]
        if (scheduleData?.runAt) {
            const date = new Date(scheduleData.runAt)
            scheduledDate.value = date.toISOString().split('T')[0] || ''
            schedule.runAt = scheduleData.runAt
        }
        schedule.timeOfDay = scheduleData?.timeOfDay
        schedule.daysOfWeek = scheduleData?.daysOfWeek
        schedule.dayOfMonth = scheduleData?.dayOfMonth
        schedule.cronExpression = scheduleData?.cronExpression
    }

    if (task.progressMeta) {
        isProgressiveEnabled.value = true
        progress.targetValue = task.progressMeta.targetValue
        progress.unit = task.progressMeta.unit || ''
        progress.aggregation = task.progressMeta.aggregation as 'TOTAL' | 'DAILY' | 'LATEST'
        progress.isCumulative = task.progressMeta.isCumulative
    }
}

function handleTypeChange(type: TaskType) {
    form.type = type
}

function onScheduledDateChange(value: string | undefined) {
    if (!value) {
        scheduledDate.value = ''
    } else {
        const d = new Date(value)
        scheduledDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    handleScheduledDateChange()
}

function onScheduledTimeChange(value: string | undefined) {
    if (!value) {
        schedule.timeOfDay = undefined
    } else {
        const d = new Date(value)
        schedule.timeOfDay = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    updateScheduleRunAt()
}

function onDeadlineDateChange(value: string | undefined) {
    if (!value) {
        deadlineDate.value = ''
    } else {
        const d = new Date(value)
        deadlineDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    handleDeadlineDateChange()
}

function onDeadlineTimeChange(value: string | undefined) {
    if (!value) {
        deadlineTime.value = ''
    } else {
        const d = new Date(value)
        deadlineTime.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    handleDeadlineTimeChange()
}

function handleScheduledDateChange() {
    if (scheduledDate.value) {
        const date = new Date(scheduledDate.value)
        if (schedule.timeOfDay) {
            const [hours, minutes] = schedule.timeOfDay.split(':')
            date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'))
        }
        schedule.runAt = date.toISOString()
    } else {
        schedule.runAt = ''
    }
}

function updateScheduleRunAt() {
    if (scheduledDate.value) {
        const date = new Date(scheduledDate.value)
        if (schedule.timeOfDay) {
            const [hours, minutes] = schedule.timeOfDay.split(':')
            date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'))
        }

        schedule.runAt = date.toISOString()
    }
}

function handleDeadlineDateChange() {
    if (deadlineDate.value) {
        const date = new Date(deadlineDate.value)
        if (deadlineTime.value) {
            const [hours, minutes] = deadlineTime.value.split(':')
            date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'))
        }
        form.scheduledFor = date.toISOString()
    } else {
        form.scheduledFor = undefined
    }
}

function handleDeadlineTimeChange() {
    if (deadlineDate.value) {
        const date = new Date(deadlineDate.value)
        if (deadlineTime.value) {
            const [hours, minutes] = deadlineTime.value.split(':')
            date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'))
        }
        form.scheduledFor = date.toISOString()
    }
}

function toggleDayOfWeek(dayIndex: number) {
    if (!schedule.daysOfWeek) {
        schedule.daysOfWeek = []
    }
    const index = schedule.daysOfWeek.indexOf(dayIndex)
    if (index > -1) {
        schedule.daysOfWeek.splice(index, 1)
    } else {
        schedule.daysOfWeek.push(dayIndex)
    }
    schedule.daysOfWeek.sort()
}

function validateForm() {
    // Validation is handled by computed isFormValid
}

function handleSubmit() {
    if (!isFormValid.value) return

    isSubmitting.value = true

    if (isEditMode.value) {
        const payload: IReqPUTUpdateTask = {
            id: Number(taskId.value),
            title: form.title,
            description: form.description || undefined,
            type: form.type,
            status: form.status,
            priority: form.priority || undefined,
        }

        if (form.type === 'ONCE' || form.type === 'DEADLINE') {
            payload.scheduledFor = form.scheduledFor
        }

        if (form.type === 'SCHEDULED') {
            payload.schedule = { ...schedule }
        }

        if (isProgressiveEnabled.value) {
            payload.progress = { ...progress }
        }

        updateTaskMutation.mutate(payload)
    } else {
        const payload: IReqPOSTCreateTask = {
            title: form.title,
            description: form.description || undefined,
            type: form.type,
            status: form.status,
            priority: form.priority || undefined,
        }

        if (form.type === 'ONCE' || form.type === 'DEADLINE') {
            payload.scheduledFor = form.scheduledFor
        }

        if (form.type === 'SCHEDULED') {
            payload.schedule = { ...schedule }
        }

        if (isProgressiveEnabled.value) {
            payload.progress = { ...progress }
        }

        createTaskMutation.mutate(payload)
    }
}

function handleCancel() {
    router.push('/dashboard')
}

function formatStatus(status?: ITaskStatus): string {
    if (!status) return 'Not set'
    return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

function formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function formatDaysOfWeek(days: number[]): string {
    return days.map((day) => weekDays[day]).join(', ')
}
</script>

<style module>
.container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
    color: #f5f5f5;
    padding-bottom: 80px;
}

.header {
    display: flex;
    align-items: center;
    padding: 20px 32px;
    border-bottom: 1px solid rgba(42, 42, 42, 0.6);
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
}

.closeButton {
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.closeButton:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
}

.title {
    margin: 0;
    margin-left: 16px;
    font-size: 24px;
    font-weight: 700;
    flex: 1;
}

.createButton {
    padding: 10px 24px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.createButton:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.createButton.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 32px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px;
}

.formSection {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.section {
    background: rgba(26, 26, 26, 0.9);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 12px;
    padding: 24px;
}

.sectionTitle {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #f5f5f5;
}

.formGroup {
    margin-bottom: 20px;
}

.formRow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #ccc;
}

.required {
    color: #ef4444;
}

.input,
.textarea,
.select {
    width: 100%;
    padding: 12px;
    background: rgba(37, 37, 37, 0.8);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 8px;
    color: #f5f5f5;
    font-size: 14px;
    transition: all 0.3s;
}

.input:focus,
.textarea:focus,
.select:focus {
    outline: none;
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input.error,
.textarea.error {
    border-color: #ef4444;
}

.textarea {
    resize: vertical;
    font-family: inherit;
}

.errorText {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #ef4444;
}

.helpText {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #999;
}

.typeSelector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.typeButton {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: rgba(37, 37, 37, 0.8);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 8px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
    font-weight: 500;
}

.typeButton:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
}

.typeButton.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.5);
    color: #c7d2fe;
}

.repeatOptions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.repeatButton {
    padding: 8px 16px;
    background: rgba(37, 37, 37, 0.8);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 6px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
}

.repeatButton:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
}

.repeatButton.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.5);
    color: #c7d2fe;
}

.daysSelector {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.dayButton {
    padding: 8px 16px;
    background: rgba(37, 37, 37, 0.8);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 6px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    min-width: 50px;
}

.dayButton:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
}

.dayButton.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.5);
    color: #c7d2fe;
}

.checkboxLabel {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #ccc;
}

.checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #6366f1;
}

.previewSection {
    position: sticky;
    top: 100px;
    height: fit-content;
}

.previewCard {
    background: rgba(26, 26, 26, 0.9);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 12px;
    padding: 24px;
}

.previewTitle {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #f5f5f5;
    border-bottom: 1px solid rgba(42, 42, 42, 0.6);
    padding-bottom: 12px;
}

.previewContent {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.previewItem {
    font-size: 14px;
    color: #ccc;
    line-height: 1.6;
}

.previewItem strong {
    color: #a5b4fc;
    margin-right: 8px;
}

@media (max-width: 1200px) {
    .content {
        grid-template-columns: 1fr;
    }

    .previewSection {
        position: static;
    }
}
</style>
