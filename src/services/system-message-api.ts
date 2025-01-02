// services/system-message-api.ts
import { BaseApi } from './base-api';
import { ApiResponse } from '../types/api.types';

interface SystemMessage {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  expires_at?: string;
  is_read?: boolean;
  user?: number;
  [key: string]: any;
}

interface SystemMessageFilters {
  type?: SystemMessage['type'];
  is_read?: boolean;
  user?: number;
  created_after?: string;
  created_before?: string;
  [key: string]: any;
}

export class SystemMessageApi extends BaseApi {
  constructor(baseURL: string) {
    super({ baseURL: `${baseURL}system_messages` });
  }

  /**
   * Получение системных сообщений
   */
  public async fetchSystemMessages(
    filters: SystemMessageFilters = {}
  ): Promise<SystemMessage[]> {
    try {
      const response = await this.get<SystemMessage[]>('/', filters);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching system messages:', error);
      throw error;
    }
  }

  /**
   * Получение непрочитанных сообщений
   */
  public async fetchUnreadMessages(): Promise<SystemMessage[]> {
    try {
      const response = await this.get<SystemMessage[]>('/', { is_read: false });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      throw error;
    }
  }

  /**
   * Отметка сообщения как прочитанного
   */
  public async markAsRead(messageId: number): Promise<SystemMessage> {
    try {
      const response = await this.patch<SystemMessage>(
        `/${messageId}/`,
        { is_read: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking message ${messageId} as read:`, error);
      throw error;
    }
  }

  /**
   * Отметка всех сообщений как прочитанных
   */
  public async markAllAsRead(): Promise<void> {
    try {
      await this.post<void>('/mark_all_read/');
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      throw error;
    }
  }

  /**
   * Создание нового системного сообщения
   */
  public async createMessage(
    message: Partial<SystemMessage>
  ): Promise<SystemMessage> {
    try {
      const response = await this.post<SystemMessage>('/', message);
      return response.data;
    } catch (error) {
      console.error('Error creating system message:', error);
      throw error;
    }
  }

  /**
   * Удаление системного сообщения
   */
  public async deleteMessage(messageId: number): Promise<void> {
    try {
      await this.delete(`/${messageId}/`);
    } catch (error) {
      console.error(`Error deleting message ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Получение количества непрочитанных сообщений
   */
  public async getUnreadCount(): Promise<number> {
    try {
      const response = await this.get<{ count: number }>('/unread_count/');
      return response.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Подписка на новые сообщения через WebSocket
   */
  public subscribeToNewMessages(
    callback: (message: SystemMessage) => void
  ): WebSocket {
    const ws = new WebSocket(
      `${this.baseURL.replace('http', 'ws')}/ws/messages/`
    );

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as SystemMessage;
        callback(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
}
