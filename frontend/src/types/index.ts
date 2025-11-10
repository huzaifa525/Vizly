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
  connection: string;
  connection_details?: Connection;
  createdAt: string;
  updatedAt: string;
}

export interface Visualization {
  id: string;
  name: string;
  type: 'table' | 'line' | 'bar' | 'horizontal_bar' | 'stacked_bar' | 'grouped_bar' | 'pie' | 'donut' | 'area' | 'stacked_area' | 'scatter' | 'bubble' | 'heatmap' | 'treemap' | 'sunburst' | 'sankey' | 'funnel' | 'radar' | 'gauge' | 'candlestick' | 'boxplot' | 'waterfall';
  config: any;
  query: string;
  query_details?: Query;
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
