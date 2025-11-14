import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, Edit2, TestTube, Plus, Search, Server, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Button from '../components/Button';
import KPICard from '../components/KPICard';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import { Connection } from '../types';
import { connectionsAPI } from '../services/connections';

const ModernConnectionsPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'postgres' as 'postgres' | 'mysql' | 'sqlite',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    ssl: false,
  });

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await connectionsAPI.getAll();
      setConnections(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        port: formData.port ? parseInt(formData.port) : undefined,
      };

      if (editingConnection) {
        await connectionsAPI.update(editingConnection.id, data);
        toast.success('Connection updated successfully');
      } else {
        await connectionsAPI.create(data);
        toast.success('Connection created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      loadConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save connection');
    }
  };

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      type: connection.type,
      host: connection.host || '',
      port: connection.port?.toString() || '',
      database: connection.database,
      username: connection.username || '',
      password: '',
      ssl: connection.ssl,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      await connectionsAPI.delete(id);
      toast.success('Connection deleted successfully');
      loadConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete connection');
    }
  };

  const handleTest = async (id: string) => {
    try {
      setTestingId(id);
      const result = await connectionsAPI.test(id);
      if (result.success) {
        toast.success('Connection successful!');
      } else {
        toast.error(result.message || 'Connection failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Connection test failed');
    } finally {
      setTestingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'postgres',
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
      ssl: false,
    });
    setEditingConnection(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.database.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const postgresCount = connections.filter(c => c.type === 'postgres').length;
  const mysqlCount = connections.filter(c => c.type === 'mysql').length;
  const sqliteCount = connections.filter(c => c.type === 'sqlite').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <h1 className="page-title">Database Connections</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader type="card" count={3} />
        </div>
        <SkeletonLoader type="card" count={3} className="space-y-4" />
      </div>
    );
  }

  if (!loading && connections.length === 0) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-info-500 to-info-600 rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="page-title">Database Connections</h1>
          </div>
        </div>

        <div className="card">
          <EmptyState
            icon={<Database size={64} />}
            title="No Database Connections"
            description="Connect to your databases to start exploring and analyzing your data."
            actionLabel="Add Connection"
            onAction={openCreateModal}
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="New Connection"
          size="lg"
        >
          <ConnectionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-info-500 to-info-600 rounded-xl">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="page-title">Database Connections</h1>
        </div>
        <Button onClick={openCreateModal} icon={<Plus size={18} />}>
          Add Connection
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Connections"
          value={connections.length}
          icon={<Database size={24} />}
          color="primary"
        />
        <KPICard
          title="PostgreSQL"
          value={postgresCount}
          icon={<Server size={24} />}
          color="info"
        />
        <KPICard
          title="MySQL"
          value={mysqlCount}
          icon={<Server size={24} />}
          color="warning"
        />
        <KPICard
          title="SQLite"
          value={sqliteCount}
          icon={<Server size={24} />}
          color="success"
        />
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-hover group relative"
          >
            {/* Type Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`badge ${
                connection.type === 'postgres' ? 'badge-info' :
                connection.type === 'mysql' ? 'badge-warning' :
                'badge-success'
              }`}>
                {connection.type}
              </span>
            </div>

            {/* Content */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-info-500 to-info-600 rounded-xl shadow-lg flex-shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {connection.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {connection.host || 'Local'} • {connection.database}
                </p>
              </div>
            </div>

            {/* Connection Details */}
            <div className="space-y-2 mb-4 text-sm">
              {connection.host && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Server size={14} />
                  <span className="truncate">{connection.host}{connection.port ? `:${connection.port}` : ''}</span>
                </div>
              )}
              {connection.username && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="font-mono text-xs truncate">{connection.username}</span>
                </div>
              )}
              {connection.ssl && (
                <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                  <CheckCircle2 size={14} />
                  <span className="text-xs">SSL Enabled</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleTest(connection.id)}
                loading={testingId === connection.id}
                icon={<TestTube size={14} />}
                fullWidth
              >
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(connection)}
                icon={<Edit2 size={14} />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(connection.id)}
                icon={<Trash2 size={14} />}
                className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {filteredConnections.length === 0 && searchQuery && (
        <div className="card">
          <EmptyState
            icon={<Search size={48} />}
            title="No Results"
            description="No connections match your search query."
          />
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingConnection ? 'Edit Connection' : 'New Connection'}
        size="lg"
      >
        <ConnectionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isEditing={!!editingConnection}
        />
      </Modal>
    </div>
  );
};

// Connection Form Component
interface ConnectionFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ConnectionForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }: ConnectionFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Connection Name *
      </label>
      <input
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="input"
        placeholder="My Database"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Database Type *
      </label>
      <select
        required
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
        className="select"
      >
        <option value="postgres">PostgreSQL</option>
        <option value="mysql">MySQL</option>
        <option value="sqlite">SQLite</option>
      </select>
    </div>

    {formData.type !== 'sqlite' && (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Host *
            </label>
            <input
              type="text"
              required
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="input"
              placeholder="localhost"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Port
            </label>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              className="input"
              placeholder={formData.type === 'postgres' ? '5432' : '3306'}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username *
          </label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password {isEditing ? '' : '*'}
          </label>
          <input
            type="password"
            required={!isEditing}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="input"
            placeholder={isEditing ? 'Leave blank to keep current password' : ''}
          />
        </div>
      </>
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Database Name *
      </label>
      <input
        type="text"
        required
        value={formData.database}
        onChange={(e) => setFormData({ ...formData, database: e.target.value })}
        className="input"
        placeholder={formData.type === 'sqlite' ? 'database.db' : 'mydb'}
      />
    </div>

    {formData.type !== 'sqlite' && (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ssl"
          checked={formData.ssl}
          onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
          className="checkbox"
        />
        <label htmlFor="ssl" className="text-sm text-gray-700 dark:text-gray-300">
          Use SSL
        </label>
      </div>
    )}

    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">
        {isEditing ? 'Update' : 'Create'}
      </Button>
    </div>
  </form>
);

export default ModernConnectionsPage;
