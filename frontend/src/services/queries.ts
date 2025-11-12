import api from './api';
import { Query, QueryResult } from '../types';

export const queriesAPI = {
  getAll: async (): Promise<Query[]> => {
    const response = await api.get('/queries/');
    return response.data.data?.queries || response.data;
  },

  getById: async (id: string): Promise<Query> => {
    const response = await api.get(`/queries/${id}/`);
    return response.data.data?.query || response.data;
  },

  create: async (data: Partial<Query>): Promise<Query> => {
    const response = await api.post('/queries/', data);
    return response.data.data?.query || response.data;
  },

  update: async (id: string, data: Partial<Query>): Promise<Query> => {
    const response = await api.put(`/queries/${id}/`, data);
    return response.data.data?.query || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/queries/${id}/`);
  },

  execute: async (id: string): Promise<QueryResult> => {
    const response = await api.post(`/queries/${id}/execute/`);
    return response.data.data || response.data;
  },

  executeRaw: async (connectionId: string, sql: string): Promise<QueryResult> => {
    const response = await api.post('/queries/execute_raw/', {
      connection_id: connectionId,
      sql,
    });
    return response.data.data || response.data;
  },

  exportCSV: async (connectionId: string, sql: string, filename: string = 'export'): Promise<void> => {
    const response = await api.post('/queries/export_csv/', {
      connection_id: connectionId,
      sql,
      filename,
    }, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportExcel: async (connectionId: string, sql: string, filename: string = 'export'): Promise<void> => {
    const response = await api.post('/queries/export_excel/', {
      connection_id: connectionId,
      sql,
      filename,
    }, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
