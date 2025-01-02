// services/base-api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { ErrorHandler } from './error-handler'
import { LocalStorage } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  success: boolean;
}

export class BaseApi {
  protected readonly api: AxiosInstance;
  private errorHandler: ErrorHandler;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config: { baseURL: string }) {
    this.api = axios.create({
      baseURL: config.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.errorHandler = ErrorHandler.getInstance()
    this.setupInterceptors()
  }

  // Методы для работы с подписчиками
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  private addSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback)
  }

  private rejectSubscribers(): void {
    this.refreshSubscribers = []
  }

  private setupInterceptors(): void {
    // Перехватчик запросов
    this.api.interceptors.request.use(
      async (config) => {
        // Пропускаем установку токена для запросов с skipAuth
        if (config.headers?.skipAuth) {
          delete config.headers.skipAuth
          return config
        }

        const token = await this.getValidToken()
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Перехватчик ответов - максимально упростим
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('Response interceptor error:', error)
        return Promise.reject(error)
      }
    )
  }

  private async getValidToken(): Promise<string | null> {
    try {
      const authStore = useAuthStore()
      return await authStore.getToken()
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  }

  protected async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<T>(endpoint, config)
      return {
        data: response.data,
        success: true
      }
    } catch (error) {
      const errorData = this.handleError(error as Error | AxiosError)
      return {
        error: errorData,
        success: false
      }
    }
  }

  protected async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log('post')
      const response = await this.api.post<T>(endpoint, data, config)
      return {
        data: response.data,
        success: true
      }
    } catch (error) {
      console.log('post error')
      const errorData = this.handleError(error as Error | AxiosError)
      return {
        error: errorData,
        success: false
      }
    }
  }

  protected async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<T>(endpoint, data, config)
      return {
        data: response.data,
        success: true
      }
    } catch (error) {
      const errorData = this.handleError(error as Error | AxiosError)
      return {
        error: errorData,
        success: false
      }
    }
  }

  protected async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch<T>(endpoint, data, config)
      return {
        data: response.data,
        success: true
      }
    } catch (error) {
      const errorData = this.handleError(error as Error | AxiosError)
      return {
        error: errorData,
        success: false
      }
    }
  }

  protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<T>(endpoint, config)
      return {
        data: response.data,
        success: true
      }
    } catch (error) {
      const errorData = this.handleError(error as Error | AxiosError)
      return {
        error: errorData,
        success: false
      }
    }
  }

  private handleError(error: Error | AxiosError) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      return {
        message: axiosError.response?.data?.message || axiosError.message,
        code: axiosError.response?.status?.toString(),
        details: axiosError.response?.data
      }
    }
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    }
  }

  // Защищенные методы для наследников

}
