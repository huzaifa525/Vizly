import { useState, useEffect } from 'react';
import { BarChart3, Trash2, Edit2, Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Table from '../components/Table';
import ChartRenderer from '../components/ChartRenderer';
import AdvancedTable from '../components/AdvancedTable';
import { Visualization, Query } from '../types';
import { visualizationsAPI } from '../services/visualizations';
import { queriesAPI } from '../services/queries';

const CHART_TYPES = [
  { value: 'table', label: 'Table', category: 'Table' },
  { value: 'line', label: 'Line Chart', category: 'Basic' },
  { value: 'bar', label: 'Bar Chart', category: 'Basic' },
  { value: 'horizontal_bar', label: 'Horizontal Bar', category: 'Bar' },
  { value: 'stacked_bar', label: 'Stacked Bar', category: 'Bar' },
  { value: 'grouped_bar', label: 'Grouped Bar', category: 'Bar' },
  { value: 'pie', label: 'Pie Chart', category: 'Basic' },
  { value: 'donut', label: 'Donut Chart', category: 'Basic' },
  { value: 'area', label: 'Area Chart', category: 'Basic' },
  { value: 'stacked_area', label: 'Stacked Area', category: 'Area' },
  { value: 'scatter', label: 'Scatter Plot', category: 'Basic' },
  { value: 'bubble', label: 'Bubble Chart', category: 'Advanced' },
  { value: 'heatmap', label: 'Heatmap', category: 'Advanced' },
  { value: 'treemap', label: 'Treemap', category: 'Advanced' },
  { value: 'sunburst', label: 'Sunburst', category: 'Advanced' },
  { value: 'sankey', label: 'Sankey Diagram', category: 'Advanced' },
  { value: 'funnel', label: 'Funnel Chart', category: 'Advanced' },
  { value: 'radar', label: 'Radar Chart', category: 'Advanced' },
  { value: 'gauge', label: 'Gauge', category: 'Advanced' },
  { value: 'candlestick', label: 'Candlestick', category: 'Financial' },
  { value: 'boxplot', label: 'Box Plot', category: 'Statistical' },
  { value: 'waterfall', label: 'Waterfall', category: 'Advanced' },
];

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
    type: 'bar',
    query: '',
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
      setVisualizations(Array.isArray(visualizationsData) ? visualizationsData : []);
      setQueries(Array.isArray(queriesData) ? queriesData : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
      setVisualizations([]);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let config = {};
      try {
        config = JSON.parse(formData.config);
      } catch {
        toast.error('Invalid JSON in configuration');
        return;
      }

      const payload: Partial<Visualization> = {
        name: formData.name,
        type: formData.type as Visualization['type'],
        query: formData.query,
        config,
      };

      if (editingVisualization) {
        await visualizationsAPI.update(editingVisualization.id, payload);
        toast.success('Visualization updated successfully');
      } else {
        await visualizationsAPI.create(payload);
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
      query: visualization.query,
      config: JSON.stringify(visualization.config || {}, null, 2),
    });
    setIsModalOpen(true);
  };

  const handleView = async (visualization: Visualization) => {
    try {
      setViewingVisualization(visualization);
      const result = await queriesAPI.execute(visualization.query);
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
      query: '',
      config: '{}',
    });
    setEditingVisualization(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const renderVisualization = () => {
    if (!viewingVisualization || !queryResult || !queryResult.rows) {
      return <div className="text-center py-8 text-gray-500">No data available</div>;
    }

    const config = viewingVisualization.config || {};

    if (viewingVisualization.type === 'table') {
      return <AdvancedTable data={queryResult.rows} config={config} />;
    }

    return <ChartRenderer type={viewingVisualization.type} data={queryResult.rows} config={config} />;
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const chartType = CHART_TYPES.find((ct) => ct.value === value);
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {chartType?.label || value}
          </span>
        );
      },
    },
    {
      key: 'query',
      label: 'Query',
      render: (_: any, row: Visualization) => row.query_details?.name || '-',
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

  // Group chart types by category
  const groupedChartTypes = CHART_TYPES.reduce((acc, chart) => {
    if (!acc[chart.category]) {
      acc[chart.category] = [];
    }
    acc[chart.category].push(chart);
    return acc;
  }, {} as Record<string, typeof CHART_TYPES>);

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
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus size={16} />
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
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            >
              {Object.entries(groupedChartTypes).map(([category, charts]) => (
                <optgroup key={category} label={category}>
                  {charts.map((chart) => (
                    <option key={chart.value} value={chart.value}>
                      {chart.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Query *
            </label>
            <select
              required
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Configuration (JSON)
            </label>
            <textarea
              value={formData.config}
              onChange={(e) => setFormData({ ...formData, config: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              rows={5}
              placeholder='{"xAxis": "column_name", "yAxis": ["value1", "value2"], "title": "My Chart"}'
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional: Configure chart axes and display options
            </p>
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
        size="full"
      >
        <div className="p-4" style={{ height: '80vh' }}>
          {renderVisualization()}
        </div>
      </Modal>
    </div>
  );
};

export default VisualizationsPage;
