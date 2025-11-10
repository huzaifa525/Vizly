import { useState, useEffect } from 'react';
import { LayoutDashboard, Trash2, Edit2, Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { Dashboard } from '../types';
import { dashboardsAPI } from '../services/dashboards';

const DashboardPage = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);

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

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (value: string) => value || '-' },
    {
      key: 'isPublic',
      label: 'Visibility',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
          {value ? 'Public' : 'Private'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Dashboard) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/${row.id}`}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title="View Dashboard"
          >
            <Eye size={18} />
          </Link>
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

  // Show welcome screen if no dashboards exist
  if (!loading && dashboards.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <LayoutDashboard size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Vizly
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your self-hosted business intelligence platform
            </p>
            <div className="space-x-4">
              <Link to="/connections" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Connect a Database
              </Link>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Create Dashboard
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="New Dashboard"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dashboard Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="My Dashboard"
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
                placeholder="What is this dashboard about?"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Make this dashboard public
              </label>
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
                Create
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboards
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} />
          Create Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <Table
          columns={columns}
          data={dashboards}
          loading={loading}
          emptyMessage="No dashboards yet. Create your first dashboard to get started."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingDashboard ? 'Edit Dashboard' : 'New Dashboard'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dashboard Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="My Dashboard"
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
              placeholder="What is this dashboard about?"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Make this dashboard public
            </label>
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
              {editingDashboard ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
