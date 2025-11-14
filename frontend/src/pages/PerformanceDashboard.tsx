import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Clock, AlertTriangle,
  CheckCircle, XCircle, Zap
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import SkeletonLoader from '../components/SkeletonLoader';

interface QueryExecution {
  id: string;
  sql: string;
  status: string;
  execution_time_ms: number;
  row_count: number;
  started_at: string;
  query_name?: string;
  user_name?: string;
}

interface PerformanceMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
  slow_queries_count: number;
  success_rate: number;
}

const PerformanceDashboard = () => {
  const [executions, setExecutions] = useState<QueryExecution[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    total_executions: 0,
    successful_executions: 0,
    failed_executions: 0,
    avg_execution_time: 0,
    slow_queries_count: 0,
    success_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);

      // In a real implementation, you'd have these endpoints
      // For now, we'll simulate the data structure
      const mockExecutions: QueryExecution[] = Array.from({ length: 20 }, (_, i) => ({
        id: `exec-${i}`,
        sql: `SELECT * FROM table_${i}`,
        status: Math.random() > 0.1 ? 'success' : 'error',
        execution_time_ms: Math.random() * 10000,
        row_count: Math.floor(Math.random() * 1000),
        started_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        query_name: `Query ${i}`,
        user_name: `User ${Math.floor(Math.random() * 5)}`,
      }));

      setExecutions(mockExecutions);

      // Calculate metrics
      const successCount = mockExecutions.filter(e => e.status === 'success').length;
      const failCount = mockExecutions.filter(e => e.status === 'error').length;
      const avgTime = mockExecutions.reduce((sum, e) => sum + e.execution_time_ms, 0) / mockExecutions.length;
      const slowCount = mockExecutions.filter(e => e.execution_time_ms > 5000).length;

      setMetrics({
        total_executions: mockExecutions.length,
        successful_executions: successCount,
        failed_executions: failCount,
        avg_execution_time: avgTime,
        slow_queries_count: slowCount,
        success_rate: (successCount / mockExecutions.length) * 100,
      });
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 badge badge-success">
            <CheckCircle size={12} />
            Success
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 badge badge-danger">
            <XCircle size={12} />
            Error
          </span>
        );
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  // Prepare chart data
  const executionTrend = executions
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    .map(e => ({
      time: new Date(e.started_at).toLocaleTimeString(),
      duration: e.execution_time_ms,
      rows: e.row_count,
    }));

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <h1 className="page-title">Performance Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-success-500 to-success-600 rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="page-title">Performance Dashboard</h1>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Executions"
          value={metrics.total_executions}
          icon={<Zap size={24} />}
          color="primary"
        />
        <KPICard
          title="Success Rate"
          value={`${metrics.success_rate.toFixed(1)}%`}
          icon={<CheckCircle size={24} />}
          color="success"
          trend={metrics.success_rate > 90 ? 'up' : 'down'}
        />
        <KPICard
          title="Avg Execution Time"
          value={formatDuration(metrics.avg_execution_time)}
          icon={<Clock size={24} />}
          color="info"
        />
        <KPICard
          title="Slow Queries"
          value={metrics.slow_queries_count}
          icon={<AlertTriangle size={24} />}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Time Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Execution Time Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#3B82F6"
                name="Duration (ms)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Row Count Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Row Count Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={executionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rows" fill="#10B981" name="Rows Returned" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Executions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Query Executions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rows
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {executions.slice(0, 10).map((execution, index) => (
                <motion.tr
                  key={execution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="max-w-xs truncate text-gray-900 dark:text-white">
                      {execution.query_name || execution.sql}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      by {execution.user_name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{getStatusBadge(execution.status)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-medium ${
                        execution.execution_time_ms > 5000
                          ? 'text-danger-600 dark:text-danger-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {formatDuration(execution.execution_time_ms)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {execution.row_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(execution.started_at).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slow Queries Alert */}
      {metrics.slow_queries_count > 0 && (
        <div className="card bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-warning-900 dark:text-warning-200 mb-1">
                Slow Queries Detected
              </h4>
              <p className="text-sm text-warning-700 dark:text-warning-300">
                {metrics.slow_queries_count} {metrics.slow_queries_count === 1 ? 'query' : 'queries'} took longer than 5 seconds to execute.
                Consider optimizing these queries or adding indexes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
