import axios from 'axios'
import Store from '../../stores/index'
export default
class SystemMessage {
  constructor (baseApiUrl) {
    this.api = axios.create({ baseURL: baseApiUrl + 'system_messages' })
  }

  async fetchSystemMessages () {
    const token = await Store.dispatch('auth/getToken')
    const response = await this.api.get('/', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    if (!response.data.length) return false
    return response.data
  }
}
