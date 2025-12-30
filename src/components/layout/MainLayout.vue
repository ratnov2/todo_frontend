<script setup lang="ts">
import type { IResGETUserMe } from '@/shared/services/user/User.types'
import { useQuery } from '@tanstack/vue-query'
import { watch, watchEffect } from 'vue'

const checkUser = useQuery<IResGETUserMe>({
    queryKey: ['me'],
})
</script>

<template>
    <div class="header">
        <span v-if="checkUser.data.value?.user.email">{{ checkUser.data.value.user.email }}</span>
    </div>
    <router-view />
</template>

<style scoped>
.header {
    background-color: rgba(80, 80, 80, 0.171);
    height: 50px;
    width: 100%;
}
</style>
