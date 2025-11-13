import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Trash2, Edit2, Eye, Plus, Search, PieChart,
  LineChart, AreaChart, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Button from '../components/Button';
import KPICard from '../components/KPICard';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import ChartRenderer from '../components/ChartRenderer';
import AdvancedTable from '../components/AdvancedTable';
import { Visualization, Query } from '../types';
import { visualizationsAPI } from '../services/visualizations';
import { queriesAPI } from '../services/queries';

const CHART_TYPES = [
  { value: 'table', label: 'Table', category: 'Table', icon: '📊' },
  { value: 'line', label: 'Line Chart', category: 'Basic', icon: '📈' },
  { value: 'bar', label: 'Bar Chart', category: 'Basic', icon: '📊' },
  { value: 'horizontal_bar', label: 'Horizontal Bar', category: 'Bar', icon: '📊' },
  { value: 'stacked_bar', label: 'Stacked Bar', category: 'Bar', icon: '📊' },
  { value: 'grouped_bar', label: 'Grouped Bar', category: 'Bar', icon: '📊' },
  { value: 'pie', label: 'Pie Chart', category: 'Basic', icon: '🍰' },
  { value: 'donut', label: 'Donut Chart', category: 'Basic', icon: '🍩' },
  { value: 'area', label: 'Area Chart', category: 'Basic', icon: '📊' },
  { value: 'stacked_area', label: 'Stacked Area', category: 'Area', icon: '📈' },
  { value: 'scatter', label: 'Scatter Plot', category: 'Basic', icon: '🔵' },
  { value: 'bubble', label: 'Bubble Chart', category: 'Advanced', icon: '🫧' },
  { value: 'heatmap', label: 'Heatmap', category: 'Advanced', icon: '🌡️' },
  { value: 'treemap', label: 'Treemap', category: 'Advanced', icon: '🗺️' },
  { value: 'sunburst', label: 'Sunburst', category: 'Advanced', icon: '☀️' },
  { value: 'sankey', label: 'Sankey Diagram', category: 'Advanced', icon: '🌊' },
  { value: 'funnel', label: 'Funnel Chart', category: 'Advanced', icon: '⏬' },
  { value: 'radar', label: 'Radar Chart', category: 'Advanced', icon: '📡' },
  { value: 'gauge', label: 'Gauge', category: 'Advanced', icon: '⏱️' },
  { value: 'candlestick', label: 'Candlestick', category: 'Financial', icon: '📊' },
  { value: 'boxplot', label: 'Box Plot', category: 'Statistical', icon: '📦' },
  { value: 'waterfall', label: 'Waterfall', category: 'Advanced', icon: '💧' },
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredVisualizations = visualizations.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chart types by category
  const groupedChartTypes = CHART_TYPES.reduce((acc, chart) => {
    if (!acc[chart.category]) {
      acc[chart.category] = [];
    }
    acc[chart.category].push(chart);
    return acc;
  }, {} as Record<string, typeof CHART_TYPES>);

  // Calculate stats
  const chartCount = visualizations.filter(v => v.type !== 'table').length;
  const tableCount = visualizations.filter(v => v.type === 'table').length;
  const basicCharts = visualizations.filter(v =>
    ['line', 'bar', 'pie', 'donut', 'area', 'scatter'].includes(v.type)
  ).length;

  const getChartIcon = (type: string) => {
    const chart = CHART_TYPES.find(ct => ct.value === type);
    return chart?.icon || '📊';
  };

  const getChartLabel = (type: string) => {
    const chart = CHART_TYPES.find(ct => ct.value === type);
    return chart?.label || type;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <h1 className="page-title">Visualizations</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader type="card" count={4} />
        </div>
        <SkeletonLoader type="card" count={3} className="space-y-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="page-title">Visualizations</h1>
        </div>
        <Button onClick={openCreateModal} icon={<Plus size={18} />}>
          Create Visualization
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Visualizations"
          value={visualizations.length}
          icon={<BarChart3 size={24} />}
          color="primary"
        />
        <KPICard
          title="Charts"
          value={chartCount}
          icon={<LineChart size={24} />}
          color="info"
        />
        <KPICard
          title="Tables"
          value={tableCount}
          icon={<AreaChart size={24} />}
          color="success"
        />
        <KPICard
          title="Basic Charts"
          value={basicCharts}
          icon={<PieChart size={24} />}
          color="warning"
        />
      </div>

      {/* Search */}
      {visualizations.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search visualizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
        </div>
      )}

      {/* Visualizations Grid */}
      {filteredVisualizations.length === 0 && !searchQuery ? (
        <div className="card">
          <EmptyState
            icon={<BarChart3 size={64} />}
            title="No Visualizations"
            description="Create charts and graphs from your query results to visualize your data."
            actionLabel="Create Visualization"
            onAction={openCreateModal}
          />
        </div>
      ) : filteredVisualizations.length === 0 && searchQuery ? (
        <div className="card">
          <EmptyState
            icon={<Search size={48} />}
            title="No Results"
            description="No visualizations match your search."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisualizations.map((viz, index) => (
            <motion.div
              key={viz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-hover group"
            >
              {/* Type Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="badge badge-secondary">
                  {getChartIcon(viz.type)} {getChartLabel(viz.type)}
                </span>
              </div>

              {/* Content */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-lg flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {viz.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {viz.query_details?.name || 'Unknown query'}
                  </p>
                </div>
              </div>

              {/* Preview Icon */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                <div className="text-5xl">
                  {getChartIcon(viz.type)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleView(viz)}
                  icon={<Eye size={14} />}
                  fullWidth
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(viz)}
                  icon={<Edit2 size={14} />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(viz.id)}
                  icon={<Trash2 size={14} />}
                  className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingVisualization ? 'Edit Visualization' : 'New Visualization'}
        size="lg"
      >
        <VisualizationForm
          formData={formData}
          setFormData={setFormData}
          queries={queries}
          groupedChartTypes={groupedChartTypes}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isEditing={!!editingVisualization}
        />
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

// Visualization Form Component
interface VisualizationFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  queries: Query[];
  groupedChartTypes: Record<string, typeof CHART_TYPES>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const VisualizationForm = ({
  formData,
  setFormData,
  queries,
  groupedChartTypes,
  onSubmit,
  onCancel,
  isEditing
}: VisualizationFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Visualization Name *
      </label>
      <input
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="input"
        placeholder="My Chart"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Chart Type *
      </label>
      <select
        required
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        className="select"
      >
        {Object.entries(groupedChartTypes).map(([category, charts]) => (
          <optgroup key={category} label={category}>
            {charts.map((chart) => (
              <option key={chart.value} value={chart.value}>
                {chart.icon} {chart.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Query *
      </label>
      <select
        required
        value={formData.query}
        onChange={(e) => setFormData({ ...formData, query: e.target.value })}
        className="select"
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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Configuration (JSON)
      </label>
      <textarea
        value={formData.config}
        onChange={(e) => setFormData({ ...formData, config: e.target.value })}
        className="input font-mono text-sm"
        rows={5}
        placeholder='{"xAxis": "column_name", "yAxis": ["value1", "value2"], "title": "My Chart"}'
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Optional: Configure chart axes and display options
      </p>
    </div>

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

export default VisualizationsPage;
