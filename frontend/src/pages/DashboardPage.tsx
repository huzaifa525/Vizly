import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Trash2, Edit2, Eye, Plus, Search, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Dashboard } from '../types';
import { dashboardsAPI } from '../services/dashboards';
import Modal from '../components/Modal';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import KPICard from '../components/KPICard';
import SkeletonLoader from '../components/SkeletonLoader';

const ModernDashboardPage = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      const data = await dashboardsAPI.getAll();
      setDashboards(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load dashboards');
      setDashboards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDashboard) {
        await dashboardsAPI.update(editingDashboard.id, formData);
        toast.success('Dashboard updated successfully');
      } else {
        await dashboardsAPI.create(formData);
        toast.success('Dashboard created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      loadDashboards();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save dashboard');
    }
  };

  const handleEdit = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard);
    setFormData({
      name: dashboard.name,
      description: dashboard.description || '',
      isPublic: dashboard.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      await dashboardsAPI.delete(id);
      toast.success('Dashboard deleted successfully');
      loadDashboards();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete dashboard');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isPublic: false,
    });
    setEditingDashboard(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publicDashboardsCount = dashboards.filter(d => d.isPublic).length;
  const privateDashboardsCount = dashboards.filter(d => !d.isPublic).length;

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <h1 className="page-title">Dashboards</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader type="card" count={3} />
        </div>
        <SkeletonLoader type="table" />
      </div>
    );
  }

  // Show welcome screen if no dashboards exist
  if (!loading && dashboards.length === 0) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="page-title">Dashboards</h1>
          </div>
        </div>

        <div className="card">
          <EmptyState
            icon={<LayoutDashboard size={64} />}
            title="Welcome to Vizly"
            description="Your self-hosted business intelligence platform. Create your first dashboard to get started."
            actionLabel="Create Dashboard"
            onAction={openCreateModal}
            secondaryActionLabel="Connect a Database"
            onSecondaryAction={() => window.location.href = '/connections'}
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Create Dashboard"
        >
          <DashboardForm
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
          <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="page-title">Dashboards</h1>
        </div>
        <Button onClick={openCreateModal} icon={<Plus size={18} />}>
          Create Dashboard
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Dashboards"
          value={dashboards.length}
          icon={<LayoutDashboard size={24} />}
          color="primary"
        />
        <KPICard
          title="Public Dashboards"
          value={publicDashboardsCount}
          icon={<Eye size={24} />}
          color="success"
        />
        <KPICard
          title="Private Dashboards"
          value={privateDashboardsCount}
          icon={<BarChart size={24} />}
          color="info"
        />
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDashboards.map((dashboard, index) => (
          <motion.div
            key={dashboard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-hover group relative"
          >
            {/* Badge */}
            <div className="absolute top-4 right-4 z-10">
              {dashboard.isPublic ? (
                <span className="badge-success">Public</span>
              ) : (
                <span className="badge-gray">Private</span>
              )}
            </div>

            {/* Content */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {dashboard.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {dashboard.description || 'No description'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={`/dashboard/${dashboard.id}`}
                className="flex-1"
              >
                <Button variant="primary" fullWidth icon={<Eye size={16} />}>
                  View
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => handleEdit(dashboard)}
                icon={<Edit2 size={16} />}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(dashboard.id)}
                icon={<Trash2 size={16} />}
                className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDashboards.length === 0 && searchQuery && (
        <div className="card">
          <EmptyState
            icon={<Search size={48} />}
            title="No Results"
            description="No dashboards match your search query."
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
        title={editingDashboard ? 'Edit Dashboard' : 'Create Dashboard'}
      >
        <DashboardForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isEditing={!!editingDashboard}
        />
      </Modal>
    </div>
  );
};

// Dashboard Form Component
interface DashboardFormProps {
  formData: { name: string; description: string; isPublic: boolean };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; description: string; isPublic: boolean }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const DashboardForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }: DashboardFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Dashboard Name *
      </label>
      <input
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="input"
        placeholder="My Dashboard"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Description
      </label>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="textarea"
        rows={3}
        placeholder="What is this dashboard about?"
      />
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="isPublic"
        checked={formData.isPublic}
        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
        className="checkbox"
      />
      <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
        Make this dashboard public
      </label>
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

export default ModernDashboardPage;
