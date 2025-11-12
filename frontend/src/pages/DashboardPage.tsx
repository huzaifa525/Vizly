import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LayoutDashboard, Plus, Eye, Edit2, Trash2, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardDescription, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Input, Textarea } from '../components/ui/Input';
import { Dashboard } from '../types';
import { dashboardsAPI } from '../services/dashboards';
import { formatDateTime } from '../lib/utils';

const dashboardSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  isPublic: z.boolean().default(false),
});

type DashboardFormData = z.infer<typeof dashboardSchema>;

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DashboardFormData>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
    },
  });

  // Fetch dashboards with React Query
  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ['dashboards'],
    queryFn: async () => {
      const data = await dashboardsAPI.getAll();
      return Array.isArray(data) ? data : [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: DashboardFormData) => dashboardsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast.success('Dashboard created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create dashboard');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DashboardFormData }) =>
      dashboardsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast.success('Dashboard updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update dashboard');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dashboardsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast.success('Dashboard deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete dashboard');
    },
  });

  const onSubmit = (data: DashboardFormData) => {
    if (editingDashboard) {
      updateMutation.mutate({ id: editingDashboard.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard);
    reset({
      name: dashboard.name,
      description: dashboard.description || '',
      isPublic: dashboard.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingDashboard(null);
    reset({
      name: '',
      description: '',
      isPublic: false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDashboard(null);
    reset();
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="heading-2">Dashboards</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage and view your dashboards
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && dashboards.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="heading-2">Dashboards</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage and view your dashboards
              </p>
            </div>
          </div>
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            Create Dashboard
          </Button>
        </div>

        <Card className="border-2 border-dashed">
          <CardBody>
            <EmptyState
              icon={<LayoutDashboard className="w-16 h-16" />}
              title="No dashboards yet"
              description="Create your first dashboard to start visualizing your data and insights."
              action={
                <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
                  Create Dashboard
                </Button>
              }
            />
          </CardBody>
        </Card>

        <DashboardModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting || createMutation.isPending}
          isEditing={!!editingDashboard}
        />
      </div>
    );
  }

  // Dashboard grid
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="heading-2">Dashboards</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dashboards.length} {dashboards.length === 1 ? 'dashboard' : 'dashboards'}
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
          Create Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard, index) => (
          <motion.div
            key={dashboard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card hover className="h-full">
              <CardBody className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate mb-1">{dashboard.name}</CardTitle>
                    {dashboard.description && (
                      <CardDescription className="line-clamp-2">
                        {dashboard.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={dashboard.isPublic ? 'success' : 'gray'} className="ml-2">
                    {dashboard.isPublic ? (
                      <><Globe className="h-3 w-3" /> Public</>
                    ) : (
                      <><Lock className="h-3 w-3" /> Private</>
                    )}
                  </Badge>
                </div>

                {dashboard.updatedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Updated {formatDateTime(dashboard.updatedAt)}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/dashboard/${dashboard.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(dashboard)}
                    className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(dashboard.id, dashboard.name)}
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

      <DashboardModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting || createMutation.isPending || updateMutation.isPending}
        isEditing={!!editingDashboard}
      />
    </div>
  );
};

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  register: any;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
}

const DashboardModal = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  errors,
  isSubmitting,
  isEditing,
}: DashboardModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Dashboard' : 'Create Dashboard'}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Dashboard Name"
          placeholder="My Analytics Dashboard"
          error={errors.name?.message}
          {...register('name')}
          required
        />

        <Textarea
          label="Description"
          placeholder="What insights does this dashboard provide?"
          error={errors.description?.message}
          {...register('description')}
          rows={3}
        />

        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <input
            type="checkbox"
            id="isPublic"
            {...register('isPublic')}
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
              Make this dashboard public
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Public dashboards can be shared with anyone
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update Dashboard' : 'Create Dashboard'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DashboardPage;
