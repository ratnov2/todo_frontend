<script setup lang="ts">
import { AuthService } from '@/shared/services/auth/Auth.types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ElMessage } from 'element-plus'

import { ref } from 'vue'

const form = ref({ email: '', password: '' })
const isLogin = ref(true)

const queryClient = useQueryClient()

const register = useMutation({
    mutationKey: ['register'],
    mutationFn: AuthService.register,
    onError(error) {
        //@ts-ignore
        ElMessage({ message: error.response.data.error, type: 'error' })
    },
})
const checkUser = useMutation({ mutationKey: ['me'] })
const login = useMutation({
    mutationKey: ['login'],
    mutationFn: AuthService.login,
    onError(error) {
        //@ts-ignore
        ElMessage({ message: error.response.data.error, type: 'error' })
    },
    onSuccess() {
        queryClient.invalidateQueries({ queryKey: ['me'] })
        // checkUser.mutate()
    },
})

const onSubmit = () => {
    console.log(isLogin.value)

    const { email, password } = form.value
    const data = { email, password }
    isLogin.value ? login.mutate(data) : register.mutate(data)
}
</script>

<template>
    <el-switch v-model="isLogin" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
    <span>{{ isLogin ? 'Логин' : 'Регистрация' }}</span>
    <div class="form">
        <el-input type="email" placeholder="email" v-model="form.email" />
        <el-input type="password" placeholder="password" v-model="form.password" />
        <el-button v-on:click="onSubmit">GO</el-button>
    </div>
</template>

<style scoped>
.form {
    background-color: rgb(228, 228, 228);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>
