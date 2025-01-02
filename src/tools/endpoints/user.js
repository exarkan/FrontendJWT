import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

export default class User {
  constructor (baseApiUrl) {
    this.api = axios.create({ baseURL: baseApiUrl + 'user' })
  }

  async getUser (userId) {
    const token = await useAuthStore().getToken()
    const response = await this.api.get('/' + userId + '/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.id) return false
    return response.data
  }

  async getAllUsers (fetchHidden = true) {
    const token = await await useAuthStore().getToken()
    const response = await this.api.get('/?is_active=' + (fetchHidden ? 'true,false' : 'true'), {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  }
}
