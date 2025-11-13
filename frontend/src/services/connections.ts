import api from './api';
import { Connection } from '../types';

export const connectionsAPI = {
  getAll: async (): Promise<Connection[]> => {
    const response = await api.get('/connections/');
    return response.data.data?.connections || response.data;
  },

  getById: async (id: string): Promise<Connection> => {
    const response = await api.get(`/connections/${id}/`);
    return response.data.data?.connection || response.data;
  },

  create: async (data: Partial<Connection>): Promise<Connection> => {
    const response = await api.post('/connections/', data);
    return response.data.data?.connection || response.data;
  },

  update: async (id: string, data: Partial<Connection>): Promise<Connection> => {
    const response = await api.put(`/connections/${id}/`, data);
    return response.data.data?.connection || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/connections/${id}/`);
  },

  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/connections/${id}/test/`);
    return response.data.data || response.data;
  },

  getSchema: async (id: string): Promise<any> => {
    const response = await api.get(`/connections/${id}/schema/`);
    return response.data.data || response.data;
  },
};
