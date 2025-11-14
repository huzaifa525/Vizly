import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Table2,
  Key,
  Search,
  Columns,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { connectionsAPI } from '../services/connections';
import { Connection } from '../types';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';

interface Schema {
  tables: TableInfo[];
}

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  row_count?: number;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  primary_key?: boolean;
  foreign_key?: string;
}

const SchemaExplorerPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await connectionsAPI.getAll();
      setConnections(data);
      if (data.length > 0) {
        setSelectedConnection(data[0].id);
        loadSchema(data[0].id);
      }
    } catch (error: any) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const loadSchema = async (connectionId: string) => {
    try {
      setLoadingSchema(true);
      const data = await connectionsAPI.getSchema(connectionId);
      setSchema(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load database schema');
      setSchema(null);
    } finally {
      setLoadingSchema(false);
    }
  };

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tableName)) {
        newSet.delete(tableName);
      } else {
        newSet.add(tableName);
      }
      return newSet;
    });
  };

  const filteredTables = schema?.tables.filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.columns.some((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Schema Explorer</h1>
        </div>
        <SkeletonLoader type="card" count={3} className="space-y-4" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Schema Explorer</h1>
        </div>
        <div className="card">
          <EmptyState
            icon={<Database size={64} />}
            title="No Connections"
            description="Create a database connection first to explore schemas."
            actionLabel="Go to Connections"
            onAction={() => window.location.href = '/connections'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="page-title">Schema Explorer</h1>
        </div>
      </div>

      {/* Connection Selector */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Database className="w-5 h-5 text-gray-400" />
          <select
            value={selectedConnection}
            onChange={(e) => {
              setSelectedConnection(e.target.value);
              loadSchema(e.target.value);
            }}
            className="select flex-1"
          >
            {connections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({conn.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tables and columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Schema Content */}
      {loadingSchema ? (
        <SkeletonLoader type="card" count={3} className="space-y-4" />
      ) : (
        <div className="space-y-4">
          {filteredTables.map((table) => {
            const isExpanded = expandedTables.has(table.name);

            return (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-hover"
              >
                {/* Table Header */}
                <button
                  onClick={() => toggleTable(table.name)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-info-500 to-info-600 rounded-lg">
                      <Table2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {table.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {table.columns.length} columns
                        {table.row_count && ` • ${table.row_count.toLocaleString()} rows`}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </button>

                {/* Columns */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4">
                      <div className="space-y-2">
                        {table.columns.map((column) => (
                          <div
                            key={column.name}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {column.primary_key && (
                                <Key className="w-4 h-4 text-warning-500" />
                              )}
                              <Columns className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {column.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {column.type}
                                  {column.foreign_key && ` → ${column.foreign_key}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {column.nullable ? (
                                <span className="badge-gray">NULLABLE</span>
                              ) : (
                                <span className="badge-primary">NOT NULL</span>
                              )}
                              {column.primary_key && (
                                <span className="badge-warning">PK</span>
                              )}
                              {column.foreign_key && (
                                <span className="badge-info">FK</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {filteredTables.length === 0 && (
            <div className="card">
              <EmptyState
                icon={<Search size={48} />}
                title="No Results"
                description="No tables or columns match your search query."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemaExplorerPage;
