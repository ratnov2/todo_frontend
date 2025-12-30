export interface IReqGETTasksAll {
    limit?: number
    offset?: number
}

export interface IReqGETOneTask {
    id: string
}
export interface IReqPOSTCreateTask {
    title: string
    description: string
    isComplex: boolean
    status: ITaskStatus
    progress: number
    dueDate: string
}
export interface IReqDELETETask {
    taskId: string
}

export interface IResDELETETask {
    message: string
}

export interface IResGETTasksAll {
    tasks: ITask[]
}

export interface ITask {
    id: string
    userId: string
    title: string
    description: string
    isComplex: boolean
    status: ITaskStatus
    progress: number
    createdAt: string
    updatedAt: string
    dueDate: string
}

export type ITaskStatus = 'todo' | 'inProgress' | 'done' | 'scheduled' | 'archived'
