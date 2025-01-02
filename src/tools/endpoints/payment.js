import axios from 'axios'
import _ from 'lodash'
import formatDate from '../formatDate'
import { useAuthStore } from 'src/stores/auth'
import { useWorkdayStore } from 'src/stores/workday'

export default class Payment {
  constructor (baseApiUrl) {
    this.api1 = axios.create({ baseURL: baseApiUrl + 'award' })
    this.api2 = axios.create({ baseURL: baseApiUrl + 'penalty' })
    this.api3 = axios.create({ baseURL: baseApiUrl + 'homework' })
    this.api4 = axios.create({ baseURL: baseApiUrl + 'payment' })
    this.api5 = axios.create({ baseURL: baseApiUrl + 'pay' })
  }

  async fetchPayments () {
    const token = await useAuthStore().getToken()
    const month = useWorkdayStore().monthGetter
    const year = useWorkdayStore().yearGetter
    const firstDate = formatDate(new Date(year, month - 1, 1))
    const secondDate = formatDate(new Date(year, month, 0))
    const awards = this.api1.get(`/?date_after=${firstDate}&date_before=${secondDate}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const penalties = this.api2.get(`/?date_after=${firstDate}&date_before=${secondDate}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const homeworks = this.api3.get(`/?date_after=${firstDate}&date_before=${secondDate}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const payments = this.api4.get(`/?date_after=${firstDate}&date_before=${secondDate}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const pay = this.api5.get(`/?date_after=${firstDate}&date_before=${secondDate}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return {
      awards: (await awards).data,
      penalties: (await penalties).data,
      homeworks: (await homeworks).data,
      payments: (await payments).data,
      pay: (await pay).data
    }
  }

  async fetchAllPayments () {
    const token = await useAuthStore().getToken()
    const month = useWorkdayStore().monthGetter
    const year = useWorkdayStore().yearGetter
    const firstDate = formatDate(new Date(year, month - 1, 1))
    const secondDate = formatDate(new Date(year, month, 0))
    const awards = await this.api1.get(`/?date_after=${firstDate}&date_before=${secondDate}&all=1`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const penalties = await this.api2.get(`/?date_after=${firstDate}&date_before=${secondDate}&all=1`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const homeworks = await this.api3.get(`/?date_after=${firstDate}&date_before=${secondDate}&all=1`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const payments = await this.api4.get(`/?date_after=${firstDate}&date_before=${secondDate}&all=1`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const pay = await this.api5.get(`/?date_after=${firstDate}&date_before=${secondDate}&all=1`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    const users1 = _.map(awards.data, 'user')
    const users2 = _.map(penalties.data, 'user')
    const users3 = _.map(homeworks.data, 'user')
    const users4 = _.map(payments.data, 'user')
    const users5 = _.map(pay.data, 'user')
    const users = _.union(users1, users2, users3, users4, users5)
    const result = {}
    for (const user of users) {
      result[user] = result[user] || {}
      result[user].awards = _.filter(awards.data, { user: user })
      result[user].penalties = _.filter(penalties.data, { user: user })
      result[user].homeworks = _.filter(homeworks.data, { user: user })
      result[user].payments = _.filter(payments.data, { user: user })
      result[user].pay = _.filter(pay.data, { user: user })
    }
    return result
  }
}
