import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const authStore = useAuthStore()
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    console.log(to.path)
    if(to.path==='/logout'){
      authStore.logout()
      next('/')
      return
    }
    const isAuthenticated = await authStore.checkAuth()
    console.log('isAuthenticated', isAuthenticated)
    let token = authStore.tokenGetter
    console.log(token)

    if (!token) {
      await authStore.setToken()
      token = authStore.tokenGetter

      if (!token) {
        if (to.path !== '/') {
          next('/')
        } else {
          next()
        }
      } else {
        if (to.path === '/' || to.path === '/login') {
          next('/authzone')
        } else {
          next()
        }
      }
    } else {
      if (to.path === '/') {
        next('/authzone')
      } else {
        next()
      }
    }
  })

  // Router.beforeEach(async (to, from, next) => {
  //   const authStore = useAuthStore()
  //   const publicPages = ['/','/login', '/register'] // страницы, доступные без авторизации
  //   const authRequired = !publicPages.includes(to.path)

  //   // Проверяем авторизацию только если переходим на защищенную страницу
  //   if (authRequired) {
  //     try {
  //       const isAuthenticated = await authStore.checkAuth()
  //       if (!isAuthenticated) {
  //         return next('/login')
  //       }
  //     } catch (error) {
  //       console.error('Auth check failed:', error)
  //       return next('/login')
  //     }
  //   }

  //   next()
  // })

  return Router
})
