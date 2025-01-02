// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import api from '../tools/api'

// export const useUserStore = defineStore('userStore', () => {
//   // State
//   const user = ref(null)
//   const isAdmin = ref(false)

//   // Getters
//   const userGetter = computed(() => user.value)

//   // Actions
//   async function setUser(userId) {
//     const data = await api.user.getUser(userId)
//     if (!data) return false
//     user.value = data
//     if(data.is_superuser)isAdmin.value = true; else isAdmin.value = false
//     return true
//   }

//   // Return everything
//   return {
//     user,
//     userGetter,
//     isAdmin,
//     setUser
//   }
// })

// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import {api} from '../services/api'
import type { User } from '../types/AllTypes'

export const useUserStore = defineStore('userStore', () => {
  // State
  const user = ref<User | null>(null)
  const isAdmin = ref<boolean>(false)

  // Getters
  const userGetter = computed((): User | null => user.value)

  // Actions
  async function setUser(userId: number): Promise<boolean> {
    try {
      const data = await api.user.getUser(userId)

      if (!data) {
        user.value = null
        isAdmin.value = false
        return false
      }

      user.value = data
      isAdmin.value = data.is_superuser || false
      return true
    } catch (error) {
      console.error('Error setting user:', error)
      user.value = null
      isAdmin.value = false
      return false
    }
  }

  async function clearUser(): Promise<void> {
    user.value = null
    isAdmin.value = false
  }

  return {
    // State
    user,
    isAdmin,

    // Getters
    userGetter,

    // Actions
    setUser,
    clearUser
  }
})
