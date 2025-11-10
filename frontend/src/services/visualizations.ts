import api from './api';
import { Visualization } from '../types';

export const visualizationsAPI = {
  getAll: async (): Promise<Visualization[]> => {
    const response = await api.get('/visualizations/');
    return response.data;
  },

  getById: async (id: string): Promise<Visualization> => {
    const response = await api.get(`/visualizations/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Visualization>): Promise<Visualization> => {
    const response = await api.post('/visualizations/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Visualization>): Promise<Visualization> => {
    const response = await api.put(`/visualizations/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/visualizations/${id}/`);
  },
};
