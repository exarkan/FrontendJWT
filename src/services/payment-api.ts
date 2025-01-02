// services/payment-api.ts
import { BaseApi } from './base-api'
import formatDate from '../tools/formatDate'
import { useWorkdayStore } from 'src/stores/workday'
import _ from 'lodash'

interface PaymentResponse {
  awards: any[];
  penalties: any[];
  homeworks: any[];
  payments: any[];
  pay: any[];
}

export class PaymentApi extends BaseApi {
  private readonly endpoints: Record<string, BaseApi>;

  constructor(baseURL: string) {
    super({ baseURL })

    // Создаем отдельные инстансы для каждого эндпоинта
    this.endpoints = {
      award: new BaseApi({ baseURL: `${baseURL}award` }),
      penalty: new BaseApi({ baseURL: `${baseURL}penalty` }),
      homework: new BaseApi({ baseURL: `${baseURL}homework` }),
      payment: new BaseApi({ baseURL: `${baseURL}payment` }),
      pay: new BaseApi({ baseURL: `${baseURL}pay` })
    }
  }

  private getDateRange() {
    const store = useWorkdayStore()
    const month = store.monthGetter
    const year = store.yearGetter
    return {
      date_after: formatDate(new Date(year, month - 1, 1)),
      date_before: formatDate(new Date(year, month, 0))
    }
  }

  public async fetchPayments(): Promise<PaymentResponse> {
    try {
      const dateRange = this.getDateRange()

      // Выполняем параллельные запросы
      const [awards, penalties, homeworks, payments, pay] = await Promise.all([
        this.endpoints.award.get('/', { params: dateRange }),
        this.endpoints.penalty.get('/', { params: dateRange }),
        this.endpoints.homework.get('/', { params: dateRange }),
        this.endpoints.payment.get('/', { params: dateRange }),
        this.endpoints.pay.get('/', { params: dateRange })
      ])

      return {
        awards: awards || [],
        penalties: penalties || [],
        homeworks: homeworks || [],
        payments: payments || [],
        pay: pay || []
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      return {
        awards: [],
        penalties: [],
        homeworks: [],
        payments: [],
        pay: []
      }
    }
  }

  public async fetchAllPayments(): Promise<Record<number, PaymentResponse>> {
    try {
      const dateRange = this.getDateRange()
      const params = {
        ...dateRange,
        all: 1
      }

      // Выполняем параллельные запросы
      const [awards, penalties, homeworks, payments, pay] = await Promise.all([
        this.endpoints.award.get('/', { params }),
        this.endpoints.penalty.get('/', { params }),
        this.endpoints.homework.get('/', { params }),
        this.endpoints.payment.get('/', { params }),
        this.endpoints.pay.get('/', { params })
      ])

      // Получаем список всех пользователей
      const users = new Set([
        ..._.map(awards, 'user'),
        ..._.map(penalties, 'user'),
        ..._.map(homeworks, 'user'),
        ..._.map(payments, 'user'),
        ..._.map(pay, 'user')
      ])

      // Группируем данные по пользователям
      return Array.from(users).reduce((acc, userId) => {
        acc[userId] = {
          awards: _.filter(awards, { user: userId }),
          penalties: _.filter(penalties, { user: userId }),
          homeworks: _.filter(homeworks, { user: userId }),
          payments: _.filter(payments, { user: userId }),
          pay: _.filter(pay, { user: userId })
        }
        return acc
      }, {} as Record<number, PaymentResponse>)
    } catch (error) {
      console.error('Error fetching all payments:', error)
      return {}
    }
  }

  // Дополнительные методы для отдельных типов платежей
  public async createPayment(type: keyof typeof this.endpoints, data: any) {
    try {
      if (!this.endpoints[type]) {
        throw new Error(`Invalid payment type: ${type}`)
      }
      return await this.endpoints[type].post('/', data)
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      throw error
    }
  }

  public async updatePayment(type: keyof typeof this.endpoints, id: number, data: any) {
    try {
      if (!this.endpoints[type]) {
        throw new Error(`Invalid payment type: ${type}`)
      }
      return await this.endpoints[type].patch(`/${id}/`, data)
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
      throw error
    }
  }

  public async deletePayment(type: keyof typeof this.endpoints, id: number) {
    try {
      if (!this.endpoints[type]) {
        throw new Error(`Invalid payment type: ${type}`)
      }
      return await this.endpoints[type].delete(`/${id}/`)
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      throw error
    }
  }
}
