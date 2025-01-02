import { LocalStorage } from 'quasar'
import axios from 'axios'
export default
class Auth {
  constructor (baseApiUrl) {
    this.api = axios.create({ baseURL: baseApiUrl + 'auth/' })
  }

  async login (login, password) {
    let response
    try {
      response = await this.api.post('access', {
        login: login,
        password: password
      })
    } catch (e) {
      console.log(e)
      return false
    }
    if (!response.data.access || !response.data.refresh) return false
    LocalStorage.set('refresh_token', response.data.refresh)
    return {
      token: response.data.access,
      payload: this.getPayload(response.data.access)
    }
  }

  logout () {
    LocalStorage.set('refresh_token', '')
  }

  async refresh (refreshToken) {
    let response
    try {
      response = await this.api.post('refresh', {
        refresh: refreshToken
      })
    } catch (e) {
      console.log(e)
      return false
    }
    if (!response.data.access || !response.data.refresh) return false
    LocalStorage.set('refresh_token', response.data.refresh)
    return {
      token: response.data.access,
      payload: this.getPayload(response.data.access)
    }
  }

  async getToken () {
    const refreshToken = LocalStorage.getItem('refresh_token')
    if (!refreshToken) return false
    const data = await this.refresh(refreshToken)
    if (!data) return false
    return {
      token: data.token,
      payload: data.payload
    }
  }

  getPayload (token) {
    try {
      const payload = JSON.parse(decodeURIComponent(atob(token.split('.')[1]).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join('')))
      return payload
    } catch (e) {
      console.log(e)
      return false
    }
  }
}
