import type { ITaskInstance, ITaskStatus } from '@/shared/services/task/task.types'

export type TaskType = 'ONCE' | 'SCHEDULED' | 'DEADLINE' | 'PROGRESSIVE'

export interface TaskProgress {
    current: number
    target: number
    unit?: string
}

export interface TaskProgressMeta {
    id: number
    taskId: number
    targetValue: number
    unit: string
    aggregation: string
    isCumulative: boolean
    createdAt: string
    updatedAt: string
}

export interface TaskProgressEntry {
    id: number
    taskId: number
    taskProgressId: number | null
    actorId: number | null
    amount: number
    groupDate: string | null
    note: string
    createdAt: string
}

export interface Task {
    id: number
    userId: number
    title: string
    description: string
    isComplex: boolean
    /**
     * Total number of ALL descendant subtasks (recursive).
     * Does NOT include the task itself.
     */
    nestedSubtasksCount?: number
    status: ITaskStatus
    progress?: TaskProgress | number
    createdAt: string
    updatedAt: string
    dueDate: string
    type?: TaskType
    priority?: number
    owner?: string
    nextRun?: string
    /**
     * Human-readable schedule description (e.g. "Пн, Ср, Пт • 04:00").
     */
    scheduleInfo?: string
    scheduledFor?: string | null
    completed?: boolean
    subtasks?: Task[]
    progressMeta?: TaskProgressMeta
    progressEntries?: TaskProgressEntry[]
    currentInstance?: ITaskInstance | null
}
