import api from './api';
import { Dashboard } from '../types';

export const dashboardsAPI = {
  getAll: async (): Promise<Dashboard[]> => {
    const response = await api.get('/dashboards/');
    return response.data.data?.dashboards || response.data;
  },

  getById: async (id: string): Promise<Dashboard> => {
    const response = await api.get(`/dashboards/${id}/`);
    return response.data.data?.dashboard || response.data;
  },

  create: async (data: Partial<Dashboard>): Promise<Dashboard> => {
    const response = await api.post('/dashboards/', data);
    return response.data.data?.dashboard || response.data;
  },

  update: async (id: string, data: Partial<Dashboard>): Promise<Dashboard> => {
    const response = await api.put(`/dashboards/${id}/`, data);
    return response.data.data?.dashboard || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/dashboards/${id}/`);
  },
};
