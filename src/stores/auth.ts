// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorage } from 'quasar'
import {api} from '../services/api'
import type { Router } from 'vue-router'

export const useAuthStore = defineStore('authStore', () => {
  // State
  const token = ref(null)
  const payload = ref(null)

  // Getters
  const tokenGetter = computed(() => token.value)
  const payloadGetter = computed(() => payload.value)

  // Actions
  async function login(payloadData) {
    try {
      console.log('payloadData:', payloadData)
      const data = await api.auth.login(payloadData.login, payloadData.password)
      console.log('data:', data)
      if (!data) return false
      token.value = data.token
      payload.value = data.payload
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async function logout(router?: Router) {
    try {
      api.auth.logout()
    } finally {
      token.value = null
      payload.value = null
      LocalStorage.remove('refresh_token')
      if (router) {
        router.push('/login')
      }
    }
  }

  async function setToken() {
    try {
      const refreshToken = LocalStorage.getItem('refresh_token')
      if (!refreshToken) {
        token.value = null
        payload.value = null
        return false
      }

      const data = await api.auth.getToken()
      if (!data) {
        token.value = null
        payload.value = null
        LocalStorage.remove('refresh_token')
        return false
      }

      token.value = data.token
      payload.value = data.payload
      return true
    } catch (error) {
      console.error('Set token error:', error)
      token.value = null
      payload.value = null
      LocalStorage.remove('refresh_token')
      return false
    }
  }

  async function getToken() {
    if (!token.value) {
      return null
    }

    if (payload.value && new Date(payload.value.exp * 1000) < Date.now()) {
      const success = await setToken()
      if (!success) {
        return null
      }
    }
    return token.value
  }

  async function checkAuth() {
    const refreshToken = LocalStorage.getItem('refresh_token')
    if (!refreshToken) {
      return false
    }
    return await setToken()
  }

  return {
    token,
    payload,
    tokenGetter,
    payloadGetter,
    login,
    logout,
    setToken,
    getToken,
    checkAuth
  }
})
