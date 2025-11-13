import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, User, Database, FileCode, BarChart3,
  LogIn, LogOut, Edit, Trash2, Eye, Share2, Play, Download
} from 'lucide-react';
import api from '../services/api';

interface ActivityLogItem {
  id: string;
  user_name: string;
  action: string;
  action_display: string;
  resource_type: string;
  resource_type_display: string;
  resource_name: string;
  description: string;
  created_at: string;
  time_ago: string;
  details?: Record<string, any>;
}

interface ActivityFeedProps {
  limit?: number;
  userId?: string;
  resourceType?: string;
  showFilters?: boolean;
}

const ActivityFeed = ({ limit = 20, userId, resourceType, showFilters = false }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: '',
    resource: resourceType || '',
  });

  useEffect(() => {
    loadActivities();
  }, [limit, userId, filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (userId) params.append('user_id', userId);
      if (filter.action) params.append('action', filter.action);
      if (filter.resource) params.append('resource_type', filter.resource);

      const response = await api.get(`/activity/logs/?${params}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Edit size={16} className="text-success-600" />;
      case 'update':
        return <Edit size={16} className="text-info-600" />;
      case 'delete':
        return <Trash2 size={16} className="text-danger-600" />;
      case 'execute':
        return <Play size={16} className="text-primary-600" />;
      case 'view':
        return <Eye size={16} className="text-gray-600" />;
      case 'export':
        return <Download size={16} className="text-warning-600" />;
      case 'share':
        return <Share2 size={16} className="text-info-600" />;
      case 'login':
        return <LogIn size={16} className="text-success-600" />;
      case 'logout':
        return <LogOut size={16} className="text-gray-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'connection':
        return <Database size={16} className="text-info-600" />;
      case 'query':
        return <FileCode size={16} className="text-primary-600" />;
      case 'dashboard':
        return <BarChart3 size={16} className="text-secondary-600" />;
      case 'visualization':
        return <BarChart3 size={16} className="text-success-600" />;
      case 'user':
      case 'role':
        return <User size={16} className="text-warning-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-success-600 dark:text-success-400';
      case 'update':
        return 'text-info-600 dark:text-info-400';
      case 'delete':
        return 'text-danger-600 dark:text-danger-400';
      case 'execute':
        return 'text-primary-600 dark:text-primary-400';
      case 'export':
        return 'text-warning-600 dark:text-warning-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex gap-3">
          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="select flex-1"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="execute">Execute</option>
            <option value="view">View</option>
            <option value="export">Export</option>
          </select>

          <select
            value={filter.resource}
            onChange={(e) => setFilter({ ...filter, resource: e.target.value })}
            className="select flex-1"
          >
            <option value="">All Resources</option>
            <option value="connection">Connections</option>
            <option value="query">Queries</option>
            <option value="dashboard">Dashboards</option>
            <option value="visualization">Visualizations</option>
            <option value="user">Users</option>
          </select>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity size={48} className="mx-auto mb-2 opacity-50" />
          <p>No activities found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {activity.user_name.charAt(0).toUpperCase()}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.user_name}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs ${getActionColor(activity.action)}`}>
                    {getActionIcon(activity.action)}
                    {activity.action_display.toLowerCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    {getResourceIcon(activity.resource_type)}
                    {activity.resource_type_display.toLowerCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {activity.resource_name || activity.description}
                </p>

                {activity.details && Object.keys(activity.details).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      View details
                    </summary>
                    <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {JSON.stringify(activity.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              {/* Time */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {activity.time_ago}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
