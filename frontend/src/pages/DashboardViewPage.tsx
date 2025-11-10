import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Responsive, WidthProvider, Layout as GridLayout } from 'react-grid-layout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Dashboard, Visualization } from '../types';
import { dashboardsAPI } from '../services/dashboards';
import { visualizationsAPI } from '../services/visualizations';
import { queriesAPI } from '../services/queries';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const DashboardViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisualizations, setSelectedVisualizations] = useState<string[]>([]);
  const [vizData, setVizData] = useState<Record<string, any>>({});
  const [layout, setLayout] = useState<GridLayout[]>([]);

  useEffect(() => {
    if (id) {
      loadDashboard();
      loadVisualizations();
    }
  }, [id]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardsAPI.getById(id!);
      setDashboard(data);

      // Parse layout if it exists
      if (data.layout) {
        try {
          setLayout(JSON.parse(data.layout));
        } catch (e) {
          console.error('Failed to parse layout:', e);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadVisualizations = async () => {
    try {
      const data = await visualizationsAPI.getAll();
      setVisualizations(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load visualizations');
    }
  };

  const loadVisualizationData = async (vizId: string) => {
    try {
      const viz = visualizations.find(v => v.id === vizId);
      if (viz) {
        const result = await queriesAPI.execute(viz.queryId);
        setVizData(prev => ({ ...prev, [vizId]: result }));
      }
    } catch (error: any) {
      console.error('Failed to load visualization data:', error);
    }
  };

  useEffect(() => {
    // Load data for all visualizations in the dashboard
    if (dashboard?.items) {
      dashboard.items.forEach(item => {
        loadVisualizationData(item.visualizationId);
      });
    }
  }, [dashboard, visualizations]);

  const handleAddVisualizations = async () => {
    if (selectedVisualizations.length === 0) {
      toast.error('Please select at least one visualization');
      return;
    }

    try {
      // Add visualizations to dashboard (simplified - in production you'd have an API endpoint)
      // For now, we'll just update the layout
      const newItems: GridLayout[] = selectedVisualizations.map((vizId, index) => ({
        i: vizId,
        x: (index * 6) % 12,
        y: Math.floor(index / 2) * 4,
        w: 6,
        h: 4,
      }));

      const updatedLayout = [...layout, ...newItems];
      setLayout(updatedLayout);

      await dashboardsAPI.update(id!, {
        layout: JSON.stringify(updatedLayout),
      });

      toast.success('Visualizations added successfully');
      setIsModalOpen(false);
      setSelectedVisualizations([]);
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add visualizations');
    }
  };

  const handleLayoutChange = async (newLayout: GridLayout[]) => {
    setLayout(newLayout);

    // Save layout to backend
    try {
      await dashboardsAPI.update(id!, {
        layout: JSON.stringify(newLayout),
      });
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const renderChart = (viz: Visualization, data: any) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    const rows = data.rows;
    const dataKeys = Object.keys(rows[0] || {});
    const xKey = dataKeys[0];
    const yKeys = dataKeys.slice(1);

    switch (viz.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
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
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows}>
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
        const pieData = rows.map((item: any) => ({
          name: item[xKey],
          value: item[yKeys[0]],
        }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_: any, index: number) => (
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
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis dataKey={yKeys[0]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={yKeys[0]} data={rows} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Dashboard not found</p>
      </div>
    );
  }

  const dashboardVisualizations = layout.map(item => {
    const viz = visualizations.find(v => v.id === item.i);
    return viz;
  }).filter(Boolean) as Visualization[];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboard.name}
            </h1>
            {dashboard.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {dashboard.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Visualization
        </button>
      </div>

      {layout.length === 0 ? (
        <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <Settings size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No visualizations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add visualizations to this dashboard to get started
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Visualization
            </button>
          </div>
        </div>
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
            <div key={viz.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {viz.name}
              </h3>
              <div className="h-full">
                {vizData[viz.id] ? (
                  renderChart(viz, vizData[viz.id])
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Spinner />
                  </div>
                )}
              </div>
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

          {visualizations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No visualizations available. Create visualizations first.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {visualizations.map((viz) => (
                <label
                  key={viz.id}
                  className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {viz.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {viz.type} • {viz.query?.name}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedVisualizations([]);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddVisualizations}
              disabled={selectedVisualizations.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Add Selected
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardViewPage;
