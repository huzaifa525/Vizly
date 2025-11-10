import { useState, useEffect } from 'react';
import { BarChart3, Trash2, Edit2, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { Visualization, Query } from '../types';
import { visualizationsAPI } from '../services/visualizations';
import { queriesAPI } from '../services/queries';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const VisualizationsPage = () => {
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingVisualization, setEditingVisualization] = useState<Visualization | null>(null);
  const [viewingVisualization, setViewingVisualization] = useState<Visualization | null>(null);
  const [queryResult, setQueryResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'bar' as 'table' | 'line' | 'bar' | 'pie' | 'area' | 'scatter',
    queryId: '',
    config: '{}',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [visualizationsData, queriesData] = await Promise.all([
        visualizationsAPI.getAll(),
        queriesAPI.getAll(),
      ]);
      setVisualizations(visualizationsData);
      setQueries(queriesData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVisualization) {
        await visualizationsAPI.update(editingVisualization.id, formData);
        toast.success('Visualization updated successfully');
      } else {
        await visualizationsAPI.create(formData);
        toast.success('Visualization created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save visualization');
    }
  };

  const handleEdit = (visualization: Visualization) => {
    setEditingVisualization(visualization);
    setFormData({
      name: visualization.name,
      type: visualization.type,
      queryId: visualization.queryId,
      config: visualization.config,
    });
    setIsModalOpen(true);
  };

  const handleView = async (visualization: Visualization) => {
    try {
      setViewingVisualization(visualization);
      const result = await queriesAPI.execute(visualization.queryId);
      setQueryResult(result);
      setIsViewModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to execute query');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visualization?')) return;

    try {
      await visualizationsAPI.delete(id);
      toast.success('Visualization deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete visualization');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'bar',
      queryId: '',
      config: '{}',
    });
    setEditingVisualization(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const renderChart = (type: string, data: any[]) => {
    if (!data || data.length === 0) {
      return <div className="text-center py-8 text-gray-500">No data available</div>;
    }

    const dataKeys = Object.keys(data[0] || {});
    const xKey = dataKeys[0];
    const yKeys = dataKeys.slice(1);

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yKeys.map((key, index) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yKeys.map((key, index) => (
                <Area key={key} type="monotone" dataKey={key} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = data.map((item) => ({
          name: item[xKey],
          value: item[yKeys[0]],
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis dataKey={yKeys[0]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={yKeys[0]} data={data} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {value}
        </span>
      )
    },
    {
      key: 'query',
      label: 'Query',
      render: (_: any, row: Visualization) => row.query?.name || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Visualization) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={28} className="text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visualizations
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          Create Visualization
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <Table
          columns={columns}
          data={visualizations}
          loading={loading}
          emptyMessage="No visualizations yet. Create charts and graphs from your query results."
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingVisualization ? 'Edit Visualization' : 'New Visualization'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visualization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="My Chart"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chart Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="table">Table</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Query *
            </label>
            <select
              required
              value={formData.queryId}
              onChange={(e) => setFormData({ ...formData, queryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Query</option>
              {queries.map((query) => (
                <option key={query.id} value={query.id}>
                  {query.name}
                </option>
              ))}
            </select>
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              {editingVisualization ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingVisualization(null);
          setQueryResult(null);
        }}
        title={viewingVisualization?.name || 'Visualization'}
        size="xl"
      >
        <div className="p-4">
          {viewingVisualization && queryResult && (
            renderChart(viewingVisualization.type, queryResult.rows)
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VisualizationsPage;
