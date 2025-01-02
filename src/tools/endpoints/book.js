import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

export default
class Book {
  constructor (baseApiUrl) {
    this.api = axios.create({ baseURL: baseApiUrl })
  }

  async fetchWorkdaysTypes () {
    const token = await useAuthStore().getToken()
    const response = await this.api.get('/workday_type/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return false
    return response.data
  }

  async fetchCompanies () {
    const token = await useAuthStore().getToken()
    const response = await this.api.get('/company/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return false
    return response.data
  }

  async fetchProjects () {
    const token = await useAuthStore().getToken()
    const response = await this.api.get('/project/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return false
    return response.data
  }

  async fetchJobs () {
    const token = await useAuthStore().getToken()
    const response = await this.api.get('/job/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return false
    return response.data
  }

  async fetchUsernames (fetchHidden = false) {
    const response = await this.api.get('/username/?is_active=' + (fetchHidden ? 'true,false' : 'true'))
    if (!response.data.length) return false
    return response.data
  }
  async fetchMenuButtons () {
    const token = await useAuthStore().getToken()
    const response = await this.api.get('/menu_button/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return false
    return response.data
  }
}
