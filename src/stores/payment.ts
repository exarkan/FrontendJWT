// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import api from '../tools/api'

// export const usePaymentStore = defineStore('paymentStore', () => {
//   // State
//   const awards = ref([])
//   const penalties = ref([])
//   const homeworks = ref([])
//   const payments = ref([])
//   const pay = ref([])

//   // Getters
//   const awardsGetter = computed(() => awards.value)
//   const penaltiesGetter = computed(() => penalties.value)
//   const homeworksGetter = computed(() => homeworks.value)
//   const paymentsGetter = computed(() => payments.value)
//   const payGetter = computed(() => pay.value)

//   // Actions
//   async function setPayment() {
//     const payment = await api.payment.fetchPayments()
//     if (!payment) return false
//     awards.value = payment.awards
//     penalties.value = payment.penalties
//     homeworks.value = payment.homeworks
//     payments.value = payment.payments
//     pay.value = payment.pay
//     return true
//   }

//   // Return everything
//   return {
//     awards,
//     penalties,
//     homeworks,
//     payments,
//     pay,
//     awardsGetter,
//     penaltiesGetter,
//     homeworksGetter,
//     paymentsGetter,
//     payGetter,
//     setPayment
//   }
// })

// stores/payment.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { api } from '../services/api'
import type { Payment } from '../types/store.types'

export const usePaymentStore = defineStore('paymentStore', () => {
  // State
  const awards = ref<Payment[]>([])
  const penalties = ref<Payment[]>([])
  const homeworks = ref<Payment[]>([])
  const payments = ref<Payment[]>([])
  const pay = ref<Payment[]>([])

  // Getters
  const awardsGetter = computed((): Payment[] => awards.value)
  const penaltiesGetter = computed((): Payment[] => penalties.value)
  const homeworksGetter = computed((): Payment[] => homeworks.value)
  const paymentsGetter = computed((): Payment[] => payments.value)
  const payGetter = computed((): Payment[] => pay.value)

  // Actions
  async function setPayment(): Promise<boolean> {
    try {
      const payment = await api.payment.fetchPayments()
      if (!payment) return false

      awards.value = payment.awards
      penalties.value = payment.penalties
      homeworks.value = payment.homeworks
      payments.value = payment.payments
      pay.value = payment.pay

      return true
    } catch (error) {
      console.error('Error setting payments:', error)
      return false
    }
  }

  return {
    // State
    awards,
    penalties,
    homeworks,
    payments,
    pay,

    // Getters
    awardsGetter,
    penaltiesGetter,
    homeworksGetter,
    paymentsGetter,
    payGetter,

    // Actions
    setPayment
  }
})
