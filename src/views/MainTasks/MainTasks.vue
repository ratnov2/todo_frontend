<script setup lang="ts">
import { TaskService } from '@/shared/services/task/task.service'
import type {
    IReqDELETETask,
    IReqPOSTCreateTask,
    IResGETTasksAll,
    ITaskStatus,
} from '@/shared/services/task/task.types'
import { Delete } from '@element-plus/icons-vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { reactive } from 'vue'

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
const deleteTask = useMutation({
    mutationKey: ['deleteTask'],
    mutationFn: (data: IReqDELETETask) => TaskService.deleteTask(data),
    onSuccess() {
        allTasks.refetch()
    },
})

const form: IReqPOSTCreateTask = reactive({
    description: '',
    status: 'pending',
    title: '',
})

const allOptions: ITaskStatus[] = ['done', 'inProgress', 'cancelled', 'pending']

const onSubmit = () => {
    const { description, status, title } = form
    createTask.mutate({ description, status, title })
}
</script>

<template>
    <span v-if="allTasks.data.value && allTasks.data.value?.items.length === 0"
        >пока ничего нет</span
    >
    <ul v-for="task in allTasks.data.value?.items.filter((task) => task.status !== 'archived')">
        <li>
            <div>
                <span>{{ task.title }}</span>
            </div>
            <el-button
                @click="() => deleteTask.mutate({ taskId: task.id })"
                type="danger"
                :icon="Delete"
                circle
            />
        </li>
    </ul>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="Title">
            <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="Description">
            <el-input v-model="form.description" />
        </el-form-item>

        <el-form-item label="status">
            <el-select v-model="form.status" placeholder="please select status">
                <el-option :label="value" :value v-for="value in allOptions" />
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">Create</el-button>
            <el-button>Cancel</el-button>
        </el-form-item>
    </el-form>
</template>
