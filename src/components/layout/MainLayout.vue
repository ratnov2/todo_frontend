<script setup lang="ts">
import BottomTabBar from './ui/BottomTabBar.vue'
import TopNavBar from './ui/TopNavBar.vue'
</script>

<template>
    <div class="layout">
        <TopNavBar />
        <main class="main">
            <router-view />
        </main>
        <BottomTabBar />
    </div>
    <!-- <div class="content">
        <div class="router">
           
        </div>
        <div class="nav">
            <div class="container">
                <icon-with-name :icon="IconHome" title="Today" :is-active="route.path === '/today'"
                    v-on:click="router.push('/today')" />
                <icon-with-name :icon="IconArrowCurveRight" title="Feed" :is-active="route.path === '/feed'"
                    v-on:click="router.push('/feed')" />

                <button class="buttonPlus" v-on:click="router.push('creatingTask')"><icon-plus /></button>

                <icon-with-name :icon="IconUsers" title="Friends" :is-active="route.path === '/friends'"
                    v-on:click="router.push('/friends')" />
                <icon-with-name :icon="IconUser" title="Profile" :is-active="route.path === '/profile'"
                    v-on:click="router.push('/profile')" />
            </div>
        </div>
    </div> -->
</template>

<style scoped>
.layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main {
    flex: 1;
}

@media (min-width: 900px) {
    .main {
        padding-bottom: 0;
    }
}
</style>
