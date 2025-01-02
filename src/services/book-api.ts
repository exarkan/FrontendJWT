// services/book-api.ts
import { BaseApi } from './base-api';
import { ApiResponse } from '../types/api.types';

interface WorkdayType {
  id: number;
  name: string;
  color: string;
  [key: string]: any;
}

interface Company {
  id: number;
  name: string;
  active: boolean;
  [key: string]: any;
}

interface Project {
  id: number;
  name: string;
  company: number;
  active: boolean;
  [key: string]: any;
}

interface Job {
  id: number;
  name: string;
  project: number;
  active: boolean;
  [key: string]: any;
}

interface Username {
  id: number;
  username: string;
  is_active: boolean;
  [key: string]: any;
}

interface MenuButton {
  id: number;
  name: string;
  url: string;
  icon: string;
  order: number;
  [key: string]: any;
}

export class BookApi extends BaseApi {
  constructor(baseURL: string) {
    super({ baseURL });
  }

  /**
   * Получение типов рабочих дней
   */
  public async fetchWorkdayTypes(): Promise<WorkdayType[]> {
    try {
      const response = await this.get<WorkdayType[]>('/workday_type/');
      return response || [];
    } catch (error) {
      console.error('Error fetching workday types:', error);
      throw error;
    }
  }

  /**
   * Получение списка компаний
   */
  public async fetchCompanies(): Promise<Company[]> {
    try {
      const response = await this.get<Company[]>('/company/');
      return response || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  /**
   * Получение списка проектов
   */
  public async fetchProjects(): Promise<Project[]> {
    try {
      const response = await this.get<Project[]>('/project/');
      return response || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Получение списка работ
   */
  public async fetchJobs(): Promise<Job[]> {
    try {
      const response = await this.get<Job[]>('/job/');
      return response || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  /**
   * Получение списка пользователей
   * @param fetchHidden - включать ли неактивных пользователей
   */
  public async fetchUsernames(fetchHidden = false): Promise<Username[]> {
    try {
      const response = await this.get<Username[]>(
        '/username/',
        { is_active: fetchHidden ? 'true,false' : 'true' },
        false
      );
      return response || [];
    } catch (error) {
      console.error('Error fetching usernames:', error);
      throw error;
    }
  }

  /**
   * Получение кнопок меню
   */
  public async fetchMenuButtons(): Promise<MenuButton[]> {
    try {
      const response = await this.get<MenuButton[]>('/menu_button/');
      return response || [];
    } catch (error) {
      console.error('Error fetching menu buttons:', error);
      throw error;
    }
  }
}
