// services/auth-api.ts
import { BaseApi } from './base-api'
import { LocalStorage } from 'quasar'
import { Notify } from 'quasar'
import axios, { AxiosError } from 'axios'

interface AuthResponse {
  access: string;
  refresh: string;
}

interface TokenData {
  token: string;
  payload: any;
}

export class AuthApi extends BaseApi {
  constructor(baseURL: string) {
    super({
      baseURL: `${baseURL}auth/`
    })
  }

  public async login(login: string, password: string): Promise<TokenData | false> {
    try {
      const response = await axios.post<AuthResponse>(
        this.api.defaults.baseURL + 'access',
        { login, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response?.data?.access && response?.data?.refresh) {
        LocalStorage.set('refresh_token', response.data.refresh)
        return {
          token: response.data.access,
          payload: this.parseToken(response.data.access)
        }
      }

      Notify.create({
        type: 'negative',
        message: 'Неверный формат ответа сервера'
      })
      return false

    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.response) {
        const status = axiosError.response.status
        const data = axiosError.response.data as any

        switch (status) {
          case 401:
            Notify.create({
              type: 'negative',
              message: data.detail || 'Неверный логин или пароль'
            })
            break
          case 400:
            Notify.create({
              type: 'negative',
              message: data.detail || 'Ошибка в данных запроса'
            })
            break
          default:
            Notify.create({
              type: 'negative',
              message: data.detail || 'Ошибка при входе в систему'
            })
        }
      } else if (axiosError.request) {
        Notify.create({
          type: 'negative',
          message: 'Нет ответа от сервера'
        })
      } else {
        Notify.create({
          type: 'negative',
          message: 'Ошибка при выполнении запроса'
        })
      }

      return false
    }
  }

  public async getToken(): Promise<TokenData | false> {
    try {
      const refreshToken = LocalStorage.getItem('refresh_token')
      if (!refreshToken) {
        return false
      }

      const response = await axios.post<AuthResponse>(
        this.api.defaults.baseURL + 'refresh',
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response?.data?.access && response?.data?.refresh) {
        LocalStorage.set('refresh_token', response.data.refresh)
        return {
          token: response.data.access,
          payload: this.parseToken(response.data.access)
        }
      }

      Notify.create({
        type: 'negative',
        message: 'Ошибка обновления токена'
      })
      LocalStorage.remove('refresh_token')
      return false

    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.response) {
        const status = axiosError.response.status
        if (status === 401) {
          LocalStorage.remove('refresh_token')
          return false
        }

        Notify.create({
          type: 'negative',
          message: 'Ошибка при обновлении токена'
        })
      } else if (axiosError.request) {
        Notify.create({
          type: 'negative',
          message: 'Нет ответа от сервера при обновлении токена'
        })
      }

      console.error('Get token error:', error)
      LocalStorage.remove('refresh_token')
      return false
    }
  }

  public logout(): void {
    try {
      LocalStorage.remove('refresh_token')
      Notify.create({
        type: 'positive',
        message: 'Вы успешно вышли из системы'
      })
    } catch (error) {
      console.error('Logout error:', error)
      Notify.create({
        type: 'negative',
        message: 'Ошибка при выходе из системы'
      })
    }
  }

  private parseToken(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Token parsing error:', error)
      Notify.create({
        type: 'negative',
        message: 'Ошибка при обработке токена'
      })
      return null
    }
  }
}
