<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query'
import { RouterLink, RouterView } from 'vue-router'
import { UserService } from './shared/services/user/User.service'
import { onBeforeMount } from 'vue'

const checkUser = useQuery({
    queryKey: ['me'],
    queryFn: UserService.getMe,
    select(data) {
        console.log('!!!!!!!!!!!!!!!!', data)
    },
    retry: 0,
})

// onBeforeMount(() => {
//     checkUser.mutate()
// })
</script>

<template>
    <header>
        <nav>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
            <RouterLink to="/auth">Auth</RouterLink>
            <RouterLink to="/tasks">Tasks</RouterLink>
        </nav>
    </header>

    <RouterView />
</template>

<style scoped></style>
