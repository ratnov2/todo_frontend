import { $authConfig } from '@/shared/api/axios.config'
import type {
    IReqDELETETask,
    IReqGETOneTask,
    IReqGETTasksAll,
    IReqPOSTCreateTask,
    IResDELETETask,
    IResGETTasksAll,
} from './task.types'

const prefix = 'task'

export const TaskService = {
    async allTasks(params: IReqGETTasksAll = {}) {
        const url = prefix + '/all'
        return $authConfig.get(url, { params }) as unknown as IResGETTasksAll
    },
    async oneTask(params: IReqGETOneTask) {
        const url = prefix
        return $authConfig.get(url, { params }) as unknown as IResGETTasksAll
    },
    async createTask(data: IReqPOSTCreateTask) {
        const url = prefix
        return $authConfig.post(url, data) as unknown as IResGETTasksAll
    },
    async deleteTask(data: IReqDELETETask) {
        const url = prefix
        return $authConfig.delete(url, { data }) as unknown as IResDELETETask
    },
}
