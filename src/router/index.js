import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        beforeEnter: (to, from, next) => {
            next({ name: 'Accounts' })
        }
    },
    {
        path: '/accounts',
        name: 'Accounts',
        component: () => import('../views/Accounts.vue')
    },
    {
        path: '/operating_dates',
        name: 'OperatingDates',
        component: () => import('../views/OperatingDates.vue')
    },
    {
        path: '/operations',
        name: 'Operations',
        component: () => import('../views/Operations.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
