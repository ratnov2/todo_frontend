import { $authConfig } from '@/shared/api/axios.config'
import type {
    IReqDELETETask,
    IReqGETOneTask,
    IReqGETTasksAll,
    IReqPATCHTaskInstance,
    IReqPOSTCreateTask,
    IReqPUTUpdateTask,
    IResDELETETask,
    IResGETTasksAll,
    IResGETTasksStats,
    IResPATCHTaskInstance,
    IResGETTaskInstanceStats,
} from './task.types'

const prefix = 'tasks'

export const TaskService = {
    async allTasks(params: IReqGETTasksAll = {}) {
        const copy = JSON.parse(JSON.stringify(params))

        const url = prefix
        return $authConfig.get(url, {
            params: copy,
            paramsSerializer: {
                indexes: null, // no brackets at all
            },
        }) as unknown as IResGETTasksAll
    },
    async oneTask(params: IReqGETOneTask) {
        const url = prefix
        return $authConfig.get(`${url}/${params.id}`) as unknown as IResGETTasksAll
    },
    async createTask(data: IReqPOSTCreateTask) {
        const url = prefix
        return $authConfig.post(url, data) as unknown as IResGETTasksAll
    },
    async updateTask(data: IReqPUTUpdateTask) {
        const url = `${prefix}/${data.id}`
        return $authConfig.patch(url, data) as unknown as IResGETTasksAll
    },
    async updateTaskInstance(data: IReqPATCHTaskInstance) {
        const url = `${prefix}/instances/${data.instanceId}`
        const { instanceId, ...payload } = data
        return $authConfig.patch(url, payload) as unknown as IResPATCHTaskInstance
    },
    async deleteTask(data: IReqDELETETask) {
        const url = prefix
        return $authConfig.delete(url, { data }) as unknown as IResDELETETask
    },
    async getStats() {
        const url = `${prefix}/stats`
        return $authConfig.get(url) as unknown as IResGETTasksStats
    },
    async getTaskStats(id: number) {
        const url = `${prefix}/${id}/stats`
        return $authConfig.get(url) as unknown as IResGETTaskInstanceStats
    },
}
