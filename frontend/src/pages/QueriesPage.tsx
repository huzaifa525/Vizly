import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Save, FileCode2, Trash2, Edit2, Download,
  Search, FileText, Database, Clock, ChevronDown
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Button from '../components/Button';
import KPICard from '../components/KPICard';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import Table from '../components/Table';
import { Query, Connection, QueryResult } from '../types';
import { queriesAPI } from '../services/queries';
import { connectionsAPI } from '../services/connections';

const QueriesPage = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState<Query | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [sqlCode, setSqlCode] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sql: '',
    connection: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [queriesData, connectionsData] = await Promise.all([
        queriesAPI.getAll(),
        connectionsAPI.getAll(),
      ]);
      setQueries(queriesData);
      setConnections(connectionsData);
      if (connectionsData.length > 0 && !selectedConnectionId) {
        setSelectedConnectionId(connectionsData[0].id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedConnectionId) {
      toast.error('Please select a database connection');
      return;
    }

    if (!sqlCode.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }

    try {
      setExecuting(true);
      const result = await queriesAPI.executeRaw(selectedConnectionId, sqlCode);
      setQueryResult(result);
      toast.success(`Query executed successfully. ${result.rowCount} rows returned.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Query execution failed');
      setQueryResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    if (!selectedConnectionId || !sqlCode.trim()) {
      toast.error('Please select a connection and enter a query');
      return;
    }

    try {
      setExporting(true);
      const filename = `query_export_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;

      if (format === 'csv') {
        await queriesAPI.exportCSV(selectedConnectionId, sqlCode, filename);
      } else if (format === 'excel') {
        await queriesAPI.exportExcel(selectedConnectionId, sqlCode, filename);
      } else {
        await queriesAPI.exportJSON(selectedConnectionId, sqlCode, filename);
      }

      toast.success(`Exported as ${format.toUpperCase()}`);
      setExportMenuOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleSave = () => {
    if (!selectedConnectionId) {
      toast.error('Please select a database connection');
      return;
    }
    setFormData({
      name: '',
      description: '',
      sql: sqlCode,
      connection: selectedConnectionId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuery) {
        await queriesAPI.update(editingQuery.id, formData);
        toast.success('Query updated successfully');
      } else {
        await queriesAPI.create(formData);
        toast.success('Query saved successfully');
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save query');
    }
  };

  const handleLoadQuery = (query: Query) => {
    setSqlCode(query.sql);
    setSelectedConnectionId(query.connection);
    setQueryResult(null);
    toast.success('Query loaded');
  };

  const handleEdit = (query: Query) => {
    setEditingQuery(query);
    setFormData({
      name: query.name,
      description: query.description || '',
      sql: query.sql,
      connection: query.connection,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return;

    try {
      await queriesAPI.delete(id);
      toast.success('Query deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete query');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sql: '',
      connection: '',
    });
    setEditingQuery(null);
  };

  const filteredQueries = queries.filter(q =>
    q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resultColumns = queryResult?.columns.map(col => ({
    key: col.name,
    label: col.name,
    render: (value: any) => {
      if (value === null) return <span className="text-gray-400">NULL</span>;
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }
  })) || [];

  // Get unique connections used in queries
  const uniqueConnectionsUsed = new Set(queries.map(q => q.connection)).size;

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <h1 className="page-title">SQL Queries</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader type="card" count={4} />
        </div>
        <SkeletonLoader type="card" count={2} className="space-y-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <FileCode2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="page-title">SQL Queries</h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Saved Queries"
          value={queries.length}
          icon={<FileText size={24} />}
          color="primary"
        />
        <KPICard
          title="Connections Used"
          value={uniqueConnectionsUsed}
          icon={<Database size={24} />}
          color="info"
        />
        <KPICard
          title="Last Execution"
          value={queryResult ? `${queryResult.rowCount} rows` : '-'}
          icon={<Clock size={24} />}
          color="success"
        />
        <KPICard
          title="Execution Time"
          value={queryResult ? `${queryResult.executionTime?.toFixed(2) || '0.00'}ms` : '-'}
          icon={<Clock size={24} />}
          color="warning"
        />
      </div>

      {/* SQL Editor Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
              <FileCode2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              SQL Editor
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="select"
            >
              <option value="">Select Connection</option>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.name}
                </option>
              ))}
            </select>
            <Button
              onClick={handleSave}
              disabled={!sqlCode.trim() || !selectedConnectionId}
              variant="outline"
              icon={<Save size={16} />}
            >
              Save
            </Button>
            <Button
              onClick={handleExecute}
              disabled={executing || !selectedConnectionId || !sqlCode.trim()}
              loading={executing}
              icon={<Play size={16} />}
              variant="success"
            >
              Execute
            </Button>
          </div>
        </div>
        <CodeMirror
          value={sqlCode}
          height="200px"
          extensions={[sql()]}
          onChange={(value) => setSqlCode(value)}
          theme="dark"
          className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
        />
      </div>

      {/* Query Results */}
      {queryResult && (
        <div className="card">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Results ({queryResult.rowCount} rows in {queryResult.executionTime?.toFixed(2) || '0.00'}ms)
            </h3>
            <div className="relative">
              <Button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                icon={<Download size={16} />}
                variant="outline"
                disabled={exporting}
              >
                Export
                <ChevronDown size={16} className="ml-1" />
              </Button>

              {exportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      disabled={exporting}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      disabled={exporting}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      disabled={exporting}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Export as JSON
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={resultColumns}
              data={queryResult.rows}
              emptyMessage="No results"
            />
          </div>
        </div>
      )}

      {/* Saved Queries Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Saved Queries
          </h3>
          <div className="flex items-center gap-3 w-full max-w-md">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input flex-1"
            />
          </div>
        </div>

        {filteredQueries.length === 0 && !searchQuery ? (
          <EmptyState
            icon={<FileCode2 size={48} />}
            title="No Saved Queries"
            description="Save your SQL queries to reuse them later."
          />
        ) : filteredQueries.length === 0 && searchQuery ? (
          <EmptyState
            icon={<Search size={48} />}
            title="No Results"
            description="No queries match your search."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQueries.map((query, index) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-hover group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex-shrink-0">
                    <FileCode2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {query.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {query.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <Database size={12} />
                    <span className="truncate">
                      {query.connection_details?.name || 'Unknown connection'}
                    </span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 max-h-20 overflow-hidden">
                    <code className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                      {query.sql}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLoadQuery(query)}
                    icon={<Play size={14} />}
                    fullWidth
                  >
                    Load
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(query)}
                    icon={<Edit2 size={14} />}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(query.id)}
                    icon={<Trash2 size={14} />}
                    className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Save Query Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingQuery ? 'Edit Query' : 'Save Query'}
        size="lg"
      >
        <QueryForm
          formData={formData}
          setFormData={setFormData}
          connections={connections}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isEditing={!!editingQuery}
        />
      </Modal>
    </div>
  );
};

// Query Form Component
interface QueryFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  connections: Connection[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const QueryForm = ({ formData, setFormData, connections, onSubmit, onCancel, isEditing }: QueryFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Query Name *
      </label>
      <input
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="input"
        placeholder="My Query"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Description
      </label>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="input"
        rows={3}
        placeholder="What does this query do?"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Connection *
      </label>
      <select
        required
        value={formData.connection}
        onChange={(e) => setFormData({ ...formData, connection: e.target.value })}
        className="select"
      >
        <option value="">Select Connection</option>
        {connections.map((conn) => (
          <option key={conn.id} value={conn.id}>
            {conn.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        SQL Query *
      </label>
      <textarea
        required
        value={formData.sql}
        onChange={(e) => setFormData({ ...formData, sql: e.target.value })}
        className="input font-mono text-sm"
        rows={8}
        placeholder="SELECT * FROM table"
      />
    </div>

    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">
        {isEditing ? 'Update' : 'Save'}
      </Button>
    </div>
  </form>
);

export default QueriesPage;
