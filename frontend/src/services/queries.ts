import api from './api';
import { Query, QueryResult } from '../types';

export const queriesAPI = {
  getAll: async (): Promise<Query[]> => {
    const response = await api.get('/queries/');
    return response.data;
  },

  getById: async (id: string): Promise<Query> => {
    const response = await api.get(`/queries/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Query>): Promise<Query> => {
    const response = await api.post('/queries/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Query>): Promise<Query> => {
    const response = await api.put(`/queries/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/queries/${id}/`);
  },

  execute: async (id: string): Promise<QueryResult> => {
    const response = await api.post(`/queries/${id}/execute/`);
    return response.data;
  },

  executeRaw: async (connectionId: string, sql: string): Promise<QueryResult> => {
    const response = await api.post('/queries/execute/', {
      connection_id: connectionId,
      sql,
    });
    return response.data;
  },
};
