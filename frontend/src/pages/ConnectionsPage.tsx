import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Database, Plus, Edit2, Trash2, TestTube, Server, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Input, Select } from '../components/ui/Input';
import { Connection } from '../types';
import { connectionsAPI } from '../services/connections';
import { formatDateTime } from '../lib/utils';

const connectionSchema = z.object({
  name: z.string().min(1, 'Connection name is required').max(100),
  type: z.enum(['postgres', 'mysql', 'sqlite']),
  host: z.string().optional(),
  port: z.string().optional(),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().optional(),
  password: z.string().optional(),
  ssl: z.boolean().default(false),
}).refine((data) => {
  if (data.type !== 'sqlite') {
    return !!data.host && !!data.username;
  }
  return true;
}, {
  message: 'Host and username are required for PostgreSQL and MySQL',
  path: ['host'],
});

type ConnectionFormData = z.infer<typeof connectionSchema>;

const ConnectionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: '',
      type: 'postgres',
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
      ssl: false,
    },
  });

  const dbType = watch('type');

  // Fetch connections
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: connectionsAPI.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ConnectionFormData) => connectionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create connection');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConnectionFormData }) =>
      connectionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update connection');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete connection');
    },
  });

  // Test mutation
  const testMutation = useMutation({
    mutationFn: (id: string) => connectionsAPI.test(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Connection test successful!');
      } else {
        toast.error(data.message || 'Connection test failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Connection test failed');
    },
  });

  const onSubmit = (data: ConnectionFormData) => {
    if (editingConnection) {
      updateMutation.mutate({ id: editingConnection.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    reset({
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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await testMutation.mutateAsync(id);
    } finally {
      setTestingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingConnection(null);
    reset({
      name: '',
      type: 'postgres',
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
      ssl: false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingConnection(null);
    reset();
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <Database className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="heading-2">Database Connections</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect to your data sources
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
  if (!isLoading && connections.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <Database className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="heading-2">Database Connections</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect to your data sources
              </p>
            </div>
          </div>
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            Add Connection
          </Button>
        </div>

        <Card className="border-2 border-dashed">
          <CardBody>
            <EmptyState
              icon={<Database className="w-16 h-16" />}
              title="No database connections"
              description="Add your first database connection to start querying and visualizing your data."
              action={
                <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
                  Add Connection
                </Button>
              }
            />
          </CardBody>
        </Card>

        <ConnectionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting || createMutation.isPending}
          isEditing={!!editingConnection}
          dbType={dbType}
        />
      </div>
    );
  }

  // Connections grid
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
            <Database className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="heading-2">Database Connections</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
          Add Connection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card hover className="h-full">
              <CardBody className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Server className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate mb-1">{connection.name}</CardTitle>
                      <Badge variant="primary" className="text-xs">
                        {connection.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  {connection.host && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Host:</span>
                      <span className="truncate">{connection.host}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Database:</span>
                    <span className="truncate">{connection.database}</span>
                  </div>
                  {connection.ssl && (
                    <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">SSL Enabled</span>
                    </div>
                  )}
                </div>

                {connection.updatedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Updated {formatDateTime(connection.updatedAt)}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTest(connection.id)}
                    isLoading={testingId === connection.id}
                    className="flex-1"
                  >
                    <TestTube className="h-4 w-4" />
                    <span>Test</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(connection)}
                    className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(connection.id, connection.name)}
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

      <ConnectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting || createMutation.isPending || updateMutation.isPending}
        isEditing={!!editingConnection}
        dbType={dbType}
      />
    </div>
  );
};

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  register: any;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
  dbType: string;
}

const ConnectionModal = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  errors,
  isSubmitting,
  isEditing,
  dbType,
}: ConnectionModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Connection' : 'New Connection'}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Connection Name"
          placeholder="My Database"
          error={errors.name?.message}
          {...register('name')}
          required
        />

        <Select
          label="Database Type"
          error={errors.type?.message}
          {...register('type')}
          required
          options={[
            { value: 'postgres', label: 'PostgreSQL' },
            { value: 'mysql', label: 'MySQL' },
            { value: 'sqlite', label: 'SQLite' },
          ]}
        />

        {dbType !== 'sqlite' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Host"
                placeholder="localhost"
                error={errors.host?.message}
                {...register('host')}
                required
              />
              <Input
                label="Port"
                type="number"
                placeholder={dbType === 'postgres' ? '5432' : '3306'}
                error={errors.port?.message}
                {...register('port')}
              />
            </div>

            <Input
              label="Username"
              placeholder="postgres"
              error={errors.username?.message}
              {...register('username')}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder={isEditing ? 'Leave blank to keep current password' : ''}
              error={errors.password?.message}
              {...register('password')}
              required={!isEditing}
              helperText={isEditing ? 'Leave blank to keep current password' : undefined}
            />
          </>
        )}

        <Input
          label="Database Name"
          placeholder={dbType === 'sqlite' ? 'database.db' : 'mydb'}
          error={errors.database?.message}
          {...register('database')}
          required
        />

        {dbType !== 'sqlite' && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <input
              type="checkbox"
              id="ssl"
              {...register('ssl')}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="ssl" className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                Use SSL/TLS encryption
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Recommended for production databases
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update Connection' : 'Create Connection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConnectionsPage;
