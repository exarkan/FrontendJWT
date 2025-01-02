// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import api from '../tools/api'

// export const useSystemMessageStore = defineStore('systemMessageStore', () => {
//   // State
//   const systemMessages = ref([])

//   // Getters
//   const systemMessageStringGetter = computed(() => {
//     if (!systemMessages.value.length) {
//       return 'Полоса служебных сообщений'
//     } else {
//       return systemMessages.value.map(m => m.text).join('\xa0'.repeat(50))
//     }
//   })

//   const systemMessagesGetter = computed(() => {
//     if (!systemMessages.value.length) {
//       return ['Полоса служебных сообщений']
//     } else {
//       return systemMessages.value
//     }
//   })

//   // Actions
//   async function setSystemMessages() {
//     const data = await api.systemMessage.fetchSystemMessages()
//     if (!data) return false
//     systemMessages.value = data
//     return true
//   }

//   // Return everything
//   return {
//     systemMessages,
//     systemMessageStringGetter,
//     systemMessagesGetter,
//     setSystemMessages
//   }
// })

// stores/system-message.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { api } from '../services/api'
import type { SystemMessage } from '../types/store.types'

export const useSystemMessageStore = defineStore('systemMessageStore', () => {
  // State
  const systemMessages = ref<SystemMessage[]>([])

  // Getters
  const systemMessageStringGetter = computed((): string => {
    if (!systemMessages.value.length) {
      return 'Полоса служебных сообщений'
    }
    return systemMessages.value.map(m => m.text).join('\xa0'.repeat(50))
  })

  const systemMessagesGetter = computed((): (SystemMessage | string)[] => {
    if (!systemMessages.value.length) {
      return ['Полоса служебных сообщений']
    }
    return systemMessages.value
  })

  // Actions
  async function setSystemMessages(): Promise<boolean> {
    try {
      const data = await api.systemMessage.fetchSystemMessages()
      if (!data) return false

      systemMessages.value = data
      return true
    } catch (error) {
      console.error('Error setting system messages:', error)
      return false
    }
  }

  return {
    // State
    systemMessages,

    // Getters
    systemMessageStringGetter,
    systemMessagesGetter,

    // Actions
    setSystemMessages
  }
})
