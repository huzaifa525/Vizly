import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Settings, Trash2, RefreshCw } from 'lucide-react';
import { Responsive, WidthProvider, Layout as GridLayout } from 'react-grid-layout';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import ChartRenderer from '../components/ChartRenderer';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardTitle } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Dashboard, Visualization } from '../types';
import { dashboardsAPI } from '../services/dashboards';
import { visualizationsAPI } from '../services/visualizations';
import { queriesAPI } from '../services/queries';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisualizations, setSelectedVisualizations] = useState<string[]>([]);
  const [vizData, setVizData] = useState<Record<string, any>>({});
  const [layout, setLayout] = useState<GridLayout[]>([]);
  const [loadingViz, setLoadingViz] = useState<Record<string, boolean>>({});

  // Fetch dashboard
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', id],
    queryFn: async () => {
      if (!id) throw new Error('No dashboard ID provided');
      const data = await dashboardsAPI.getById(id);

      // Parse layout if it exists
      if (data.layout) {
        try {
          const parsedLayout = JSON.parse(data.layout);
          setLayout(parsedLayout);
        } catch (e) {
          console.error('Failed to parse layout:', e);
        }
      }

      return data;
    },
    enabled: !!id,
  });

  // Fetch all visualizations
  const { data: visualizations = [], isLoading: visualizationsLoading } = useQuery({
    queryKey: ['visualizations'],
    queryFn: async () => {
      const response = await visualizationsAPI.getAll();
      return Array.isArray(response) ? response : [];
    },
  });

  // Update dashboard mutation
  const updateDashboardMutation = useMutation({
    mutationFn: (data: Partial<Dashboard>) => dashboardsAPI.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update dashboard');
    },
  });

  // Load visualization data
  const loadVisualizationData = async (vizId: string) => {
    setLoadingViz(prev => ({ ...prev, [vizId]: true }));
    try {
      const viz = visualizations.find(v => v.id === vizId);
      if (viz) {
        const result = await queriesAPI.execute(viz.query);
        setVizData(prev => ({ ...prev, [vizId]: result }));
      }
    } catch (error: any) {
      toast.error(`Failed to load visualization data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingViz(prev => ({ ...prev, [vizId]: false }));
    }
  };

  // Load data for all visualizations in the dashboard
  useEffect(() => {
    if (layout.length > 0 && visualizations.length > 0) {
      layout.forEach(item => {
        loadVisualizationData(item.i);
      });
    }
  }, [layout.length, visualizations.length]);

  const handleAddVisualizations = async () => {
    if (selectedVisualizations.length === 0) {
      toast.error('Please select at least one visualization');
      return;
    }

    try {
      // Filter out visualizations that are already in the layout
      const newVizIds = selectedVisualizations.filter(
        vizId => !layout.some(item => item.i === vizId)
      );

      if (newVizIds.length === 0) {
        toast.error('All selected visualizations are already in the dashboard');
        return;
      }

      // Create new layout items
      const newItems: GridLayout[] = newVizIds.map((vizId, index) => ({
        i: vizId,
        x: (layout.length + index) % 2 === 0 ? 0 : 6,
        y: Math.floor((layout.length + index) / 2) * 4,
        w: 6,
        h: 4,
      }));

      const updatedLayout = [...layout, ...newItems];
      setLayout(updatedLayout);

      await updateDashboardMutation.mutateAsync({
        layout: JSON.stringify(updatedLayout),
      });

      // Load data for new visualizations
      newVizIds.forEach(vizId => loadVisualizationData(vizId));

      toast.success('Visualizations added successfully');
      setIsModalOpen(false);
      setSelectedVisualizations([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add visualizations');
    }
  };

  const handleLayoutChange = async (newLayout: GridLayout[]) => {
    setLayout(newLayout);

    // Save layout to backend (debounced in practice)
    try {
      await updateDashboardMutation.mutateAsync({
        layout: JSON.stringify(newLayout),
      });
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const handleRemoveVisualization = async (vizId: string) => {
    if (!window.confirm('Remove this visualization from the dashboard?')) return;

    const updatedLayout = layout.filter(item => item.i !== vizId);
    setLayout(updatedLayout);

    try {
      await updateDashboardMutation.mutateAsync({
        layout: JSON.stringify(updatedLayout),
      });

      // Remove viz data
      setVizData(prev => {
        const newData = { ...prev };
        delete newData[vizId];
        return newData;
      });

      toast.success('Visualization removed from dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove visualization');
    }
  };

  const handleRefreshVisualization = (vizId: string) => {
    loadVisualizationData(vizId);
    toast.success('Refreshing visualization...');
  };

  const renderVisualization = (viz: Visualization) => {
    const data = vizData[viz.id];
    const isLoading = loadingViz[viz.id];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!data || !data.rows || data.rows.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      );
    }

    const config = viz.config || {};
    return <ChartRenderer type={viz.type} data={data.rows} config={config} />;
  };

  const dashboardVisualizations = layout
    .map(item => visualizations.find(v => v.id === item.i))
    .filter(Boolean) as Visualization[];

  const availableVisualizations = visualizations.filter(
    viz => !layout.some(item => item.i === viz.id)
  );

  if (dashboardLoading || visualizationsLoading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <EmptyState
          icon={<Settings className="w-16 h-16" />}
          title="Dashboard not found"
          description="The dashboard you're looking for doesn't exist or has been deleted."
          action={
            <Button onClick={() => navigate('/')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Dashboards
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="heading-2">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {dashboard.description}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Add Visualization
        </Button>
      </div>

      {layout.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardBody>
            <EmptyState
              icon={<Settings className="w-16 h-16" />}
              title="No visualizations yet"
              description="Add visualizations to this dashboard to start building your analytics view."
              action={
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                  Add Visualization
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
        >
          {dashboardVisualizations.map((viz) => (
            <div key={viz.id}>
              <Card className="h-full">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <CardTitle className="text-sm">{viz.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshVisualization(viz.id)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVisualization(viz.id)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardBody className="p-4">
                  <div style={{ height: 'calc(100% - 2rem)' }}>
                    {renderVisualization(viz)}
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisualizations([]);
        }}
        title="Add Visualizations"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select visualizations to add to this dashboard
          </p>

          {availableVisualizations.length === 0 ? (
            <EmptyState
              icon={<Settings className="w-12 h-12" />}
              title="No available visualizations"
              description="All visualizations are already in the dashboard, or no visualizations exist yet."
            />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {availableVisualizations.map((viz, index) => (
                  <motion.label
                    key={viz.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVisualizations.includes(viz.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVisualizations([...selectedVisualizations, viz.id]);
                        } else {
                          setSelectedVisualizations(selectedVisualizations.filter(id => id !== viz.id));
                        }
                      }}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viz.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {viz.type} {viz.query_details?.name && `• ${viz.query_details.name}`}
                      </p>
                    </div>
                  </motion.label>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedVisualizations([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddVisualizations}
              disabled={selectedVisualizations.length === 0}
              isLoading={updateDashboardMutation.isPending}
            >
              Add {selectedVisualizations.length > 0 && `(${selectedVisualizations.length})`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardViewPage;
