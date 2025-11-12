import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart3, Plus, Edit2, Trash2, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import ChartRenderer from '../components/ChartRenderer';
import AdvancedTable from '../components/AdvancedTable';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Visualization, Query } from '../types';
import { visualizationsAPI } from '../services/visualizations';
import { queriesAPI } from '../services/queries';
import { formatDateTime } from '../lib/utils';

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

// Group chart types by category for select
const groupedChartTypes = CHART_TYPES.reduce((acc, chart) => {
  if (!acc[chart.category]) {
    acc[chart.category] = [];
  }
  acc[chart.category].push(chart);
  return acc;
}, {} as Record<string, typeof CHART_TYPES>);

const visualizationSchema = z.object({
  name: z.string().min(1, 'Visualization name is required').max(100),
  type: z.string().min(1, 'Chart type is required'),
  query: z.string().min(1, 'Query is required'),
  config: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Configuration must be valid JSON'),
});

type VisualizationFormData = z.infer<typeof visualizationSchema>;

const VisualizationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingVisualization, setEditingVisualization] = useState<Visualization | null>(null);
  const [viewingVisualization, setViewingVisualization] = useState<Visualization | null>(null);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [executingQuery, setExecutingQuery] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisualizationFormData>({
    resolver: zodResolver(visualizationSchema),
    defaultValues: {
      name: '',
      type: 'bar',
      query: '',
      config: '{}',
    },
  });

  // Fetch visualizations
  const { data: visualizations = [], isLoading: visualizationsLoading } = useQuery({
    queryKey: ['visualizations'],
    queryFn: async () => {
      const response = await visualizationsAPI.getAll();
      return Array.isArray(response) ? response : [];
    },
  });

  // Fetch queries
  const { data: queries = [], isLoading: queriesLoading } = useQuery({
    queryKey: ['queries'],
    queryFn: async () => {
      const response = await queriesAPI.getAll();
      return Array.isArray(response) ? response : [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: VisualizationFormData) => {
      const config = data.config ? JSON.parse(data.config) : {};
      return visualizationsAPI.create({
        name: data.name,
        type: data.type as Visualization['type'],
        query: data.query,
        config,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visualizations'] });
      toast.success('Visualization created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create visualization');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VisualizationFormData }) => {
      const config = data.config ? JSON.parse(data.config) : {};
      return visualizationsAPI.update(id, {
        name: data.name,
        type: data.type as Visualization['type'],
        query: data.query,
        config,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visualizations'] });
      toast.success('Visualization updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update visualization');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => visualizationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visualizations'] });
      toast.success('Visualization deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete visualization');
    },
  });

  const onSubmit = (data: VisualizationFormData) => {
    if (editingVisualization) {
      updateMutation.mutate({ id: editingVisualization.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (visualization: Visualization) => {
    setEditingVisualization(visualization);
    reset({
      name: visualization.name,
      type: visualization.type,
      query: visualization.query,
      config: JSON.stringify(visualization.config || {}, null, 2),
    });
    setIsModalOpen(true);
  };

  const handleView = async (visualization: Visualization) => {
    setViewingVisualization(visualization);
    setExecutingQuery(true);
    setIsViewModalOpen(true);

    try {
      const result = await queriesAPI.execute(visualization.query);
      setQueryResult(result);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to execute query');
      setQueryResult(null);
    } finally {
      setExecutingQuery(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingVisualization(null);
    reset({
      name: '',
      type: 'bar',
      query: '',
      config: '{}',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVisualization(null);
    reset();
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingVisualization(null);
    setQueryResult(null);
  };

  const renderVisualization = () => {
    if (executingQuery) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading visualization...</p>
          </div>
        </div>
      );
    }

    if (!viewingVisualization || !queryResult || !queryResult.rows) {
      return (
        <div className="flex items-center justify-center h-full">
          <EmptyState
            icon={<BarChart3 className="w-12 h-12" />}
            title="No data available"
            description="Unable to load visualization data"
          />
        </div>
      );
    }

    const config = viewingVisualization.config || {};

    if (viewingVisualization.type === 'table') {
      return <AdvancedTable data={queryResult.rows} config={config} />;
    }

    return <ChartRenderer type={viewingVisualization.type} data={queryResult.rows} config={config} />;
  };

  const getChartTypeLabel = (type: string) => {
    const chartType = CHART_TYPES.find((ct) => ct.value === type);
    return chartType?.label || type;
  };

  const loadingState = visualizationsLoading || queriesLoading;

  if (loadingState) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="heading-2">Visualizations</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create charts and graphs from your data
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!loadingState && visualizations.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="heading-2">Visualizations</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create charts and graphs from your data
              </p>
            </div>
          </div>
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            Create Visualization
          </Button>
        </div>

        <Card className="border-2 border-dashed">
          <CardBody>
            <EmptyState
              icon={<TrendingUp className="w-16 h-16" />}
              title="No visualizations"
              description="Create your first visualization to turn query results into beautiful charts and graphs."
              action={
                <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
                  Create Visualization
                </Button>
              }
            />
          </CardBody>
        </Card>

        <VisualizationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting || createMutation.isPending}
          isEditing={!!editingVisualization}
          queries={queries}
          groupedChartTypes={groupedChartTypes}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="heading-2">Visualizations</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {visualizations.length} {visualizations.length === 1 ? 'visualization' : 'visualizations'}
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
          Create Visualization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visualizations.map((visualization, index) => (
          <motion.div
            key={visualization.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card hover className="h-full">
              <CardBody className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate mb-2">{visualization.name}</CardTitle>
                    <Badge variant="primary" className="text-xs">
                      {getChartTypeLabel(visualization.type)}
                    </Badge>
                  </div>
                  <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                    <BarChart3 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Query:</span>
                    <span className="truncate">
                      {visualization.query_details?.name || 'Unknown'}
                    </span>
                  </div>
                  {visualization.updatedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {formatDateTime(visualization.updatedAt)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleView(visualization)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(visualization)}
                    className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(visualization.id, visualization.name)}
                    className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20"
                    isLoading={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <VisualizationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting || createMutation.isPending || updateMutation.isPending}
        isEditing={!!editingVisualization}
        queries={queries}
        groupedChartTypes={groupedChartTypes}
      />

      <Modal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
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

interface VisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  register: any;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
  queries: Query[];
  groupedChartTypes: Record<string, typeof CHART_TYPES>;
}

const VisualizationModal = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  errors,
  isSubmitting,
  isEditing,
  queries,
  groupedChartTypes,
}: VisualizationModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Visualization' : 'New Visualization'}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Visualization Name"
          placeholder="Sales Overview Chart"
          error={errors.name?.message}
          {...register('name')}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Chart Type <span className="text-error-500">*</span>
          </label>
          <select
            {...register('type')}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.type
                ? 'border-error-300 dark:border-error-600 focus:ring-error-500 focus:border-error-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-brand-500 focus:border-brand-500'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors`}
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
          {errors.type && (
            <p className="error-text mt-1">{errors.type.message}</p>
          )}
        </div>

        <Select
          label="Query"
          error={errors.query?.message}
          {...register('query')}
          required
          options={queries.map((q) => ({
            value: q.id,
            label: q.name,
          }))}
        />

        <Textarea
          label="Configuration (JSON)"
          placeholder='{"xAxis": "date", "yAxis": ["revenue", "profit"], "title": "Revenue vs Profit"}'
          error={errors.config?.message}
          {...register('config')}
          rows={6}
          helperText="Optional: Configure chart axes, title, colors, and display options in JSON format"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update Visualization' : 'Create Visualization'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VisualizationsPage;
