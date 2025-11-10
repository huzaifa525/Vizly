export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface Connection {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  ssl: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Query {
  id: string;
  name: string;
  description?: string;
  sql: string;
  connectionId: string;
  connection?: Connection;
  createdAt: string;
  updatedAt: string;
}

export interface Visualization {
  id: string;
  name: string;
  type: 'table' | 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  config: string;
  queryId: string;
  query?: Query;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout?: string;
  isPublic: boolean;
  items?: DashboardItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardItem {
  id: string;
  dashboardId: string;
  visualizationId: string;
  visualization?: Visualization;
  position: string;
  createdAt: string;
}

export interface QueryResult {
  columns: { name: string; dataType: number }[];
  rows: any[];
  rowCount: number;
}
