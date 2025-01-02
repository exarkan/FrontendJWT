// services/error-handler.ts
import { AxiosError } from 'axios'
import { Notify } from 'quasar'
import router from '../router'

export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Обработка ошибок API
  handleApiError(error: AxiosError | any): AppError {
    if (error.response) {
      // Ошибка от сервера с ответом
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401:
          this.handleAuthError()
          break
        case 403:
          this.handleForbiddenError()
          break
        case 404:
          this.handleNotFoundError()
          break
        case 422:
          this.handleValidationError(data)
          break
        case 500:
          this.handleServerError()
          break
        default:
          this.handleUnknownError(error)
      }

      return {
        name: 'ApiError',
        message: data.message || 'API Error',
        code: `API_${status}`,
        status,
        details: data
      }
    } else if (error.request) {
      // Ошибка без ответа от сервера
      this.handleNetworkError()
      return {
        name: 'NetworkError',
        message: 'Network Error',
        code: 'NETWORK_ERROR'
      }
    } else {
      // Остальные ошибки
      this.handleUnknownError(error)
      return {
        name: 'UnknownError',
        message: error.message,
        code: 'UNKNOWN_ERROR'
      }
    }
  }

  // Обработка ошибок приложения
  handleAppError(error: Error): AppError {
    console.error('Application Error:', error)
    this.showErrorNotification('Произошла ошибка в приложении')
    return {
      name: error.name,
      message: error.message,
      code: 'APP_ERROR'
    }
  }

  // Специфичные обработчики
  private handleAuthError(): void {
    this.showErrorNotification('Необходима авторизация')
    router.push('/login')
  }

  private handleForbiddenError(): void {
    this.showErrorNotification('Нет доступа')
  }

  private handleNotFoundError(): void {
    this.showErrorNotification('Ресурс не найден')
  }

  private handleValidationError(data: any): void {
    const message = this.formatValidationErrors(data)
    this.showErrorNotification(message)
  }

  private handleServerError(): void {
    this.showErrorNotification('Ошибка сервера')
  }

  private handleNetworkError(): void {
    this.showErrorNotification('Проблемы с сетью')
  }

  private handleUnknownError(error: any): void {
    console.error('Unknown Error:', error)
    this.showErrorNotification('Произошла неизвестная ошибка')
  }

  // Вспомогательные методы
  private formatValidationErrors(data: any): string {
    if (typeof data === 'string') return data

    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    }

    return 'Ошибка валидации'
  }

  private showErrorNotification(message: string): void {
    Notify.create({
      type: 'negative',
      message: message,
      position: 'top',
      timeout: 3000
    })
  }

  // Логирование ошибок
  logError(error: AppError | Error): void {
    // Здесь можно добавить отправку ошибок в сервис аналитики
    console.error('Error logged:', {
      name: error.name,
      message: error.message,
      code: (error as AppError).code,
      status: (error as AppError).status,
      details: (error as AppError).details,
      stack: error.stack
    })
  }
}
