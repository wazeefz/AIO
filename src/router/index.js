import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'

// Ensure dashboard has requiresAuth meta
const protectedPaths = ['/dashboard', '/prompt', '/projects', '/upload-cv']

const processedRoutes = setupLayouts(routes).map((route) => {
  if (protectedPaths.some((path) => route.path.startsWith(path))) {
    return { ...route, meta: { ...route.meta, requiresAuth: true } }
  }
  return route
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: processedRoutes,
})

// ✅ Navigation Guard for Authentication
router.beforeEach((to, from) => {
  const isAuthenticated = !!localStorage.getItem('user') // Check if 'user' exists

  console.log('Navigating to:', to.fullPath)
  console.log('Route Meta:', to.meta)
  console.log('isAuthenticated:', isAuthenticated)

  // Redirect to dashboard if already logged in and trying to access login/signup
  if (isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
    console.log('Already authenticated! Redirecting to dashboard...')
    return { path: '/dashboard' }
  }

  // Redirect to login if trying to access protected routes without authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Not authenticated! Redirecting to login...')
    return { path: '/login', query: { returnTo: to.fullPath } }
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
