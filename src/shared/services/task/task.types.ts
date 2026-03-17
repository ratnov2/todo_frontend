export type TaskSort = 'newest' | 'oldest'

export interface IReqGETTasksAll {
    limit?: number
    offset?: number
    status?: ITaskStatus[]
    type?: TaskType[]
    ownerId?: number[]
    startDate?: string // ISO date string
    endDate?: string // ISO date string
    sort?: TaskSort
    q?: string // Search query for title/description
}

export interface IReqGETOneTask {
    id: string
}
export type TaskType = 'ONCE' | 'SCHEDULED' | 'DEADLINE' | 'PROGRESSIVE'
export type ITaskStatus = 'pending' | 'inProgress' | 'done' | 'cancelled'

export type ITaskInstanceStatus = ITaskStatus | 'skipped'

export interface IReqPOSTCreateTask {
    title: string
    description?: string
    type?: TaskType
    status?: ITaskStatus
    priority?: number
    scheduledFor?: string // ISO date string
    schedule?: ICreateScheduleDto
    progress?: ICreateTaskProgressDto
}

export interface ICreateScheduleDto {
    type: TaskType
    runAt: string // ISO date string
    timeOfDay?: string // Format: "HH:mm"
    daysOfWeek?: number[] // Array of day numbers (0-6, where 0 is Sunday)
    dayOfMonth?: number // 1-31
    cronExpression?: string
}

export interface ITaskSchedule extends ICreateScheduleDto {
    id: number
    taskId: number
    createdAt: string
    updatedAt: string
}

export interface ITaskInstance {
    id: number
    taskId: number
    scheduleId: number
    occurrenceAt: string // ISO date string
    dueAt: string | null // ISO date string
    status: ITaskInstanceStatus
    createdById: number | null
    completedAt: string | null
    attempt: number
    meta: Record<string, unknown> | null
    createdAt: string
    updatedAt: string
    progressEntries?: {
        id: number
        taskId: number
        taskProgressId: number | null
        actorId: number | null
        amount: number
        groupDate: string | null
        note: string
        createdAt: string
        taskInstanceId?: number | null
    }[]
    progressTotal?: number
}

export interface ICreateTaskProgressDto {
    targetValue: number
    unit: string
    aggregation: 'TOTAL' | 'DAILY' | 'LATEST'
    isCumulative?: boolean // Default: true
}

export interface ICreateProgressEntryDto {
    amount: number
    taskInstanceId?: number
    actorId?: number
    groupDate?: string // ISO date string
    note?: string
    taskProgressId?: number
}

export interface IReqPOSTAddProgressEntry {
    taskId: number
    dto: ICreateProgressEntryDto
}

export interface IReqPUTUpdateTask {
    id: number
    title?: string
    description?: string
    type?: TaskType
    status?: ITaskStatus
    priority?: number
    scheduledFor?: string
    schedule?: ICreateScheduleDto
    progress?: ICreateTaskProgressDto
}

export interface IReqDELETETask {
    taskId: number
}

export interface IResDELETETask {
    message: string
}

export interface IResGETTasksAll {
    items: ITask[]
}

export interface ITaskOwner {
    id: number
    email: string
    name: string | null
    role: string
    createdAt: string
}

export interface ITask {
    id: number
    title: string
    description: string
    type?: TaskType
    status: ITaskStatus
    priority?: number
    ownerId?: number
    owner?: ITaskOwner
    parentId?: number | null
    createdAt: string
    updatedAt?: string
    scheduledFor?: string | null // ISO 8601 date string
    subtasks?: ITask[]
    progressMeta: {
        id: number
        taskId: number
        targetValue: number
        unit: string
        aggregation: string
        isCumulative: boolean
        createdAt: string
        updatedAt: string
    }
    progressEntries?: {
        id: number
        taskId: number
        taskProgressId: number | null
        actorId: number | null
        amount: number
        groupDate: string | null
        note: string
        createdAt: string
    }[]
    schedules?: ITaskSchedule[]
    currentInstance?: ITaskInstance | null
}

export interface IReqPATCHTaskInstance {
    instanceId: number
    status?: ITaskInstanceStatus
    dueAt?: string | null // ISO date string
}

export interface IResPATCHTaskInstance {
    task: ITask
    currentInstance: ITaskInstance | null
}

export interface IResGETTaskInstanceStats {
    done: number
    failed: number
    missed: number
}

export interface IResGETTasksStats {
    total: number
    today: number
    progressiveToday: number
    byStatus: {
        done: number
        inProgress: number
        cancelled: number
        pending: number
    }
}
