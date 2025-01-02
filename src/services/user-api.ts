// services/user-api.ts
import { BaseApi } from './base-api'
import type { User } from '../types/AllTypes'

export class UserApi extends BaseApi {
  constructor(baseURL: string) {
    super({ baseURL: `${baseURL}user` })
  }

  /**
   * Получение данных пользователя по ID
   */
  public async getUser(userId: number): Promise<User | false> {
    try {
      const response = await this.get<User>(`/${userId}/`)

      // Проверяем наличие данных в ответе
      if (!response || typeof response !== 'object') {
        console.error('Invalid response format:', response)
        return false
      }

      return response
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error)
      return false
    }
  }

  /**
   * Получение списка всех пользователей
   */
  public async getAllUsers(
    fetchHidden = true
  ): Promise<User[]> {
    try {
      const response = await this.get<User[]>(
        '/',
        {
          params: {
            is_active: fetchHidden ? 'true,false' : 'true'
          }
        }
      )

      if (!Array.isArray(response)) {
        console.error('Invalid response format:', response)
        return []
      }

      return response
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  /**
   * Обновление данных пользователя
   */
  public async updateUser(
    userId: number,
    userData: Partial<User>
  ): Promise<User | false> {
    try {
      const response = await this.patch<User>(`/${userId}/`, userData)

      if (!response || typeof response !== 'object') {
        console.error('Invalid response format:', response)
        return false
      }

      return response
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error)
      return false
    }
  }

  /**
   * Создание нового пользователя
   */
  public async createUser(userData: Partial<User>): Promise<User | false> {
    try {
      const response = await this.post<User>('/', userData)

      if (!response || typeof response !== 'object') {
        console.error('Invalid response format:', response)
        return false
      }

      return response
    } catch (error) {
      console.error('Error creating user:', error)
      return false
    }
  }

  /**
   * Удаление пользователя
   */
  public async deleteUser(userId: number): Promise<boolean> {
    try {
      await this.delete(`/${userId}/`)
      return true
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error)
      return false
    }
  }
}
