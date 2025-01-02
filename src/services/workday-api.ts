// services/workday-api.ts
import { BaseApi } from './base-api'
import _ from 'lodash'
import formatDate from '../tools/formatDate'
import { useAuthStore } from 'src/stores/auth'
import { useWorkdayStore } from 'src/stores/workday'
import { useBookStore } from 'src/stores/book'
import type { WorkDay, WorkTime, Note } from '../types/AllTypes'

export class WorkdayApi extends BaseApi {
  constructor(baseApiUrl: string) {
    super({ baseURL: baseApiUrl + 'workday' })
  }

  private async getAuthHeaders() {
    const token = await useAuthStore().getToken()
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  async fetchWorkdays() {
    try {
      const authHeaders = await this.getAuthHeaders()
      const userId = useAuthStore().payloadGetter.user_id
      const year = useWorkdayStore().yearGetter
      const firstDate = formatDate(new Date(year, 0, 1))
      const secondDate = formatDate(new Date(year + 1, 0, 0))

      const response = await this.api.get<WorkDay[]>(
        `/?user=${userId}&date_after=${firstDate}&date_before=${secondDate}`,
        authHeaders
      )

      if (!response.data.length) return []

      return _.keyBy(response.data, (val) =>
        `${new Date(val.date).getMonth() + 1}.${new Date(val.date).getDate()}`
      )
    } catch (error) {
      console.error('Error fetching workdays:', error)
      throw error
    }
  }

  async fetchGeneralCalendar(fetchHidden = true) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const month = useWorkdayStore().monthGetter
      const year = useWorkdayStore().yearGetter
      const firstDate = formatDate(new Date(year, month - 1, 1))
      const secondDate = formatDate(new Date(year, month, 0))

      const response = await this.api.get<WorkDay[]>(
        `/?date_after=${firstDate}&date_before=${secondDate}&user__is_active=${fetchHidden ? 'true,false' : 'true'}`,
        authHeaders
      )

      if (!response.data.length) return []

      const usernames = useBookStore().usernamesGetter
      return { workdays: response.data, usernames }
    } catch (error) {
      console.error('Error fetching general calendar:', error)
      throw error
    }
  }

  async fetchAllWorkdays() {
    try {
      const authHeaders = await this.getAuthHeaders()
      const month = useWorkdayStore().monthGetter
      const year = useWorkdayStore().yearGetter
      const firstDate = formatDate(new Date(year, month - 1, 1))
      const secondDate = formatDate(new Date(year, month, 0))

      const response = await this.api.get<WorkDay[]>(
        `/?date_after=${firstDate}&date_before=${secondDate}`,
        authHeaders
      )
      return response.data
    } catch (error) {
      console.error('Error fetching all workdays:', error)
      throw error
    }
  }

  async fetchToday() {
    try {
      const authHeaders = await this.getAuthHeaders()
      const userId = useAuthStore().payloadGetter.user_id
      const date = formatDate(new Date())

      const response = await this.api.get<WorkDay[]>(
        `/?user=${userId}&date_after=${date}&date_before=${date}`,
        authHeaders
      )

      if (!response.data.length) return false
      return response.data
    } catch (error) {
      console.error('Error fetching today:', error)
      throw error
    }
  }

  async fetchWorkTime() {
    try {
      const authHeaders = await this.getAuthHeaders()
      const today = useWorkdayStore().todayGetter

      if (!today) return false

      let response = await this.api.get<WorkTime[]>(
        `/${today.id}/workday_time/`,
        authHeaders
      )

      if (!response.data.length || response.data[response.data.length - 1].work_time_stop) {
        response = await this.api.post<WorkTime>(
          `/${today.id}/workday_time/`,
          {},
          authHeaders
        )
        return response.data
      }

      return response.data[response.data.length - 1]
    } catch (error) {
      console.error('Error fetching work time:', error)
      throw error
    }
  }

  async patchWorkTime(id: number, data: Partial<WorkTime>) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const today = useWorkdayStore().todayGetter.id

      const response = await this.api.patch<WorkTime>(
        `/${today}/workday_time/${id}/`,
        data,
        authHeaders
      )
      return response.data
    } catch (error) {
      console.error('Error patching work time:', error)
      throw error
    }
  }

  async createWorkTimeRequest(id: number, data: any) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.post(
        `/${id}/workday_time_request/`,
        data,
        authHeaders
      )
      return response.data
    } catch (error) {
      console.error('Error creating work time request:', error)
      throw error
    }
  }

  async createWorkday(workdayData: Partial<WorkDay>) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.post<WorkDay>(
        '/',
        workdayData,
        authHeaders
      )

      if (!response.data.id) return false
      return response.data
    } catch (error) {
      console.error('Error creating workday:', error)
      throw error
    }
  }

  async updateWorkday(workdayId: number, workdayData: Partial<WorkDay>) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.patch<WorkDay>(
        `/${workdayId}/`,
        workdayData,
        authHeaders
      )

      if (!response.data) return false
      return response.data
    } catch (error) {
      console.error('Error updating workday:', error)
      throw error
    }
  }

  async getWorkday(workdayId: number) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.get<WorkDay>(
        `/${workdayId}/`,
        authHeaders
      )

      if (!response.data.id) return false
      return response.data
    } catch (error) {
      console.error('Error getting workday:', error)
      throw error
    }
  }

  async deleteWorkday(workdayId: number) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.delete(
        `/${workdayId}/`,
        authHeaders
      )
      return !response.data
    } catch (error) {
      console.error('Error deleting workday:', error)
      throw error
    }
  }

  async createNote(id: number, data: Partial<Note>) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.post<Note>(
        `/${id}/note/`,
        data,
        authHeaders
      )
      return response.data
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  }

  async updateNote(id: number, noteId: number, data: Partial<Note>) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.patch<Note>(
        `/${id}/note/${noteId}/`,
        data,
        authHeaders
      )
      return response.data
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  }

  async deleteNote(id: number, noteId: number) {
    try {
      const authHeaders = await this.getAuthHeaders()
      const response = await this.api.delete<void>(
        `/${id}/note/${noteId}/`,
        authHeaders
      )
      return response.data
    } catch (error) {
      console.error('Error deleting note:', error)
      throw error
    }
  }
}
