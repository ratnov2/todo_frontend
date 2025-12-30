import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TheAuth from '../views/TheAuth/TheAuth.vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import MainTasks from '@/views/MainTasks/MainTasks.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
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
            ],
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue'),
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
