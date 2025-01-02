// services/token-service.ts
import axios, { AxiosInstance } from 'axios';
import { LocalStorage } from 'quasar';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface TokenResult {
  token: string;
  payload: any;
}

/**
 * Сервис для управления токенами
 * Выделен в отдельный класс для избежания циклических зависимостей
 */
export class TokenService {
  private readonly api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL: `${baseURL}auth/`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Обновление access токена с использованием refresh токена
   */
  public async refreshToken(refreshToken: string): Promise<TokenResult | null> {
    try {
      const response = await this.api.post<TokenResponse>('refresh', {
        refresh: refreshToken
      });

      if (!response.data.access || !response.data.refresh) {
        return null;
      }

      // Сохраняем новый refresh токен
      LocalStorage.set('refresh_token', response.data.refresh);

      return {
        token: response.data.access,
        payload: this.parseToken(response.data.access)
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Очищаем невалидный refresh токен
      LocalStorage.remove('refresh_token');
      return null;
    }
  }

  /**
   * Парсинг JWT токена
   */
  private parseToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token parsing failed:', error);
      return null;
    }
  }
}

// Создаем и экспортируем единственный экземпляр сервиса
export const tokenService = new TokenService('http://localhost:8000/');
