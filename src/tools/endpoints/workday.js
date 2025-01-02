import axios from 'axios'
import formatDate from '../formatDate'
import _ from 'lodash'
import { useAuthStore } from 'src/stores/auth'
import { useWorkdayStore } from 'src/stores/workday'
import { useBookStore } from 'src/stores/book'

export default class Workday {
  constructor (baseApiUrl) {
    this.api = axios.create({ baseURL: baseApiUrl + 'workday' })
  }

  async fetchWorkdays () {
    const token = await useAuthStore().getToken()
    const userId = useAuthStore().payloadGetter.user_id
    const year = useWorkdayStore().yearGetter
    const firstDate = formatDate(new Date(year, 0, 1))
    const secondDate = formatDate(new Date(year + 1, 0, 0))
    const response = await this.api.get(`/?user=${userId}&date_after=${firstDate}&date_before=${secondDate}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return []
    return _.keyBy(response.data, (val) => ((new Date(val.date)).getMonth() + 1) + '.' + (new Date(val.date).getDate()))
  }

  async fetchGeneralCalendar (fetchHidden = true) {
    const token = await useAuthStore().getToken()
    const month = useWorkdayStore().monthGetter
    const year = useWorkdayStore().yearGetter
    const firstDate = formatDate(new Date(year, month - 1, 1))
    const secondDate = formatDate(new Date(year, month, 0))
    const response = await this.api.get(`/?date_after=${firstDate}&date_before=${secondDate}&user__is_active=${fetchHidden ? 'true,false' : 'true'}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return []
    const usernames = useBookStore().usernamesGetter
    return { workdays: response.data, usernames: usernames }
  }

  async fetchAllWorkdays () {
    const token = await useAuthStore().getToken()
    const month = useWorkdayStore().monthGetter
    const year = useWorkdayStore().yearGetter
    const firstDate = formatDate(new Date(year, month - 1, 1))
    const secondDate = formatDate(new Date(year, month, 0))
    const response = await this.api.get(`/?date_after=${firstDate}&date_before=${secondDate}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  }

  async fetchToday () {
    const token = await useAuthStore().getToken()
    const userId = useAuthStore().payloadGetter.user_id
    const date = formatDate(new Date())
    const response = await this.api.get(`/?user=${userId}&date_after=${date}&date_before=${date}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return false
    return response.data
  }

  async fetchWorkTime () {
    const token = await useAuthStore().getToken()
    const today = useWorkdayStore().todayGetter
    if (!today) return false
    let response = await this.api.get('/' + today.id + '/workday_time/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length || response.data[response.data.length - 1].work_time_stop) {
      response = await this.api.post('/' + today.id + '/workday_time/', {}, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      return response.data
    }
    return response.data[response.data.length - 1]
  }

  async patchWorkTime (id, data) {
    const token = await useAuthStore().getToken()
    const today = useWorkdayStore().todayGetter.id
    let response = await this.api.patch('/' + today + '/workday_time/' + id + '/', data, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  }

  async createWorkTimeRequest (id, data) {
    const token = await useAuthStore().getToken()
    let response = await this.api.post('/' + id + '/workday_time_request/', data, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  }

  async createWorkday (workdayData) {
    const token = await useAuthStore().getToken()
    const response = await this.api.post('/', workdayData, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.id) return false
    return response.data
  }

  async updateWorkday (workdayId, workdayData) {
    const token = await useAuthStore().getToken()
    const response = await this.api.patch('/' + workdayId + '/', workdayData, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data) return false
    return response.data
  }

  async getWorkday (workdayId) {
    const token = await useAuthStore().getToken()
    const response = await this.api.get('/' + workdayId + '/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.id) return false
    return response.data
  }

  async deleteWorkday (workdayId) {
    const token = await useAuthStore().getToken()
    const response = await this.api.delete('/' + workdayId + '/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (response.data) return false
    return response.data
  }

  async createNote (id, data) {
    const token = await useAuthStore().getToken()
    let response = await this.api.post('/' + id + '/note/', data, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  }

  async updateNote (id, noteId, data) {
    const token = await useAuthStore().getToken()
    let response = await this.api.patch('/' + id + '/note/' + noteId + '/', data, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  }

  async deleteNote (id, noteId) {
    const token = await useAuthStore().getToken()
    let response = await this.api.delete('/' + id + '/note/' + noteId + '/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  }
}
