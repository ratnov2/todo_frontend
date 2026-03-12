import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TheAuth from '../views/TheAuth/TheAuth.vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import MainTasks from '@/views/MainTasks/MainTasks.vue'
import CreatingTask from '@/views/CreatingTask/CreatingTask.vue'
import Today from '@/views/Today/Today.vue'
import TaskDashboard from '@/views/TaskDashboard/TaskDashboard.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'layout',
            component: MainLayout, //
            children: [
                {
                    path: '',
                    name: 'home',
                    component: HomeView,
                },
                {
                    path: 'tasks',
                    name: 'tasks',
                    component: MainTasks,
                },
                {
                    path: 'creatingTask',
                    name: 'creatingTask',
                    component: CreatingTask,
                },
                {
                    path: 'editTask/:id',
                    name: 'editTask',
                    component: CreatingTask,
                },
                {
                    path: 'today',
                    name: 'today',
                    component: Today,
                },
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: TaskDashboard,
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('../views/Profile/Profile.vue'),
                },
                {
                    path: 'achievements',
                    name: 'achievements',
                    component: () => import('../views/Achievements/Achievements.vue'),
                },
            ],
        },
        {
            path: '/dashboard',
            name: 'dashboard-standalone',
            component: TaskDashboard,
        },
        {
            path: '/auth',
            name: 'auth',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: TheAuth,
        },
    ],
})

export default router
