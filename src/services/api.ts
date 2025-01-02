// api/index.ts
import { AuthApi } from './auth-api';
import { WorkdayApi } from './workday-api';
import { PaymentApi } from './payment-api';
import { BookApi } from './book-api';
import { UserApi } from './user-api';
import { SystemMessageApi } from './system-message-api';

interface ApiInstance {
  auth: AuthApi;
  workday: WorkdayApi;
  payment: PaymentApi;
  book: BookApi;
  user: UserApi;
  systemMessage: SystemMessageApi;
}

const createApiInstance = (baseUrl: string): ApiInstance => {
  // Определяем базовый URL API
  const apiVersion = '';
  const baseApiUrl = baseUrl;
  const versionedBaseUrl = `${baseApiUrl}${apiVersion}`;

  // Создаем экземпляры всех API сервисов
  return {
    auth: new AuthApi(baseApiUrl),
    workday: new WorkdayApi(versionedBaseUrl),
    payment: new PaymentApi(versionedBaseUrl),
    book: new BookApi(versionedBaseUrl),
    user: new UserApi(versionedBaseUrl),
    systemMessage: new SystemMessageApi(versionedBaseUrl)
  };
};

// Создаем и экспортируем инстанс API
export const baseUrl = 'http://localhost:8000/';
export const api = createApiInstance(baseUrl);

// Экспортируем типы для использования в приложении
export type { ApiInstance };
