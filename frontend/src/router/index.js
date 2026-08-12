import { createRouter, createWebHistory } from 'vue-router'
import BoardsOverview from '../views/BoardsOverview.vue'
import BoardDetail from '../views/BoardDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import { useAuthStore } from '../store/authStore'

const routes = [
  {
    path: '/',
    name: 'BoardsOverview',
    component: BoardsOverview,
    meta: { requiresAuth: true }
  },
  {
    path: '/board/:id',
    name: 'BoardDetail',
    component: BoardDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
