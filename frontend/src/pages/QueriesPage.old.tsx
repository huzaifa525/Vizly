import { useState, useEffect } from 'react';
import { Play, Save, FileCode2, Trash2, Edit2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Spinner from '../components/Spinner';
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

  const queryColumns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (value: string) => value || '-' },
    {
      key: 'connection',
      label: 'Connection',
      render: (_: any, row: Query) => row.connection_details?.name || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Query) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadQuery(row)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Load Query"
          >
            <FileCode2 size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const resultColumns = queryResult?.columns.map(col => ({
    key: col.name,
    label: col.name,
    render: (value: any) => {
      if (value === null) return <span className="text-gray-400">NULL</span>;
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }
  })) || [];

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      {/* SQL Editor Section */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FileCode2 size={24} className="text-blue-600" />
              SQL Editor
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={selectedConnectionId}
                onChange={(e) => setSelectedConnectionId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Connection</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSave}
                disabled={!sqlCode.trim() || !selectedConnectionId}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleExecute}
                disabled={executing || !selectedConnectionId || !sqlCode.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {executing ? <Spinner size="sm" /> : <Play size={16} />}
                Execute
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <CodeMirror
            value={sqlCode}
            height="200px"
            extensions={[sql()]}
            onChange={(value) => setSqlCode(value)}
            theme="dark"
            className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
          />
        </div>
      </div>

      {/* Query Results */}
      {queryResult && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Results ({queryResult.rowCount} rows)
            </h3>
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

      {/* Saved Queries */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Saved Queries
          </h3>
        </div>
        <Table
          columns={queryColumns}
          data={queries}
          loading={loading}
          emptyMessage="No saved queries yet. Create your first query to explore your data."
        />
      </div>

      {/* Save Query Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingQuery ? 'Edit Query' : 'Save Query'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Query Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="My Query"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="What does this query do?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection *
            </label>
            <select
              required
              value={formData.connection}
              onChange={(e) => setFormData({ ...formData, connection: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SQL Query *
            </label>
            <textarea
              required
              value={formData.sql}
              onChange={(e) => setFormData({ ...formData, sql: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              rows={8}
              placeholder="SELECT * FROM table"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {editingQuery ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QueriesPage;
