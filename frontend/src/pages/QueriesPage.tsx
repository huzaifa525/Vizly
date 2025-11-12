import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Play, Save, FileCode, Trash2, Edit2, Plus, Database, Clock, Download, FileSpreadsheet } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import AdvancedTable from '../components/AdvancedTable';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Query, Connection, QueryResult } from '../types';
import { queriesAPI } from '../services/queries';
import { connectionsAPI } from '../services/connections';
import { formatDateTime } from '../lib/utils';

const querySchema = z.object({
  name: z.string().min(1, 'Query name is required').max(100),
  description: z.string().max(500).optional(),
  sql: z.string().min(1, 'SQL query is required'),
  connection: z.string().min(1, 'Connection is required'),
});

type QueryFormData = z.infer<typeof querySchema>;

const QueriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState<Query | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [sqlCode, setSqlCode] = useState('-- Write your SQL query here\nSELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [executingRaw, setExecutingRaw] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'excel' | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QueryFormData>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      name: '',
      description: '',
      sql: '',
      connection: '',
    },
  });

  // Fetch queries
  const { data: queries = [], isLoading: queriesLoading } = useQuery({
    queryKey: ['queries'],
    queryFn: queriesAPI.getAll,
  });

  // Fetch connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: connectionsAPI.getAll,
    onSuccess: (data) => {
      if (data.length > 0 && !selectedConnectionId) {
        setSelectedConnectionId(data[0].id);
      }
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: QueryFormData) => queriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      toast.success('Query saved successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save query');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: QueryFormData }) =>
      queriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      toast.success('Query updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update query');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => queriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      toast.success('Query deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete query');
    },
  });

  const onSubmit = (data: QueryFormData) => {
    if (editingQuery) {
      updateMutation.mutate({ id: editingQuery.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleExecuteRaw = async () => {
    if (!selectedConnectionId) {
      toast.error('Please select a connection');
      return;
    }

    if (!sqlCode.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }

    setExecutingRaw(true);
    try {
      const result = await queriesAPI.executeRaw({
        connection_id: selectedConnectionId,
        sql: sqlCode,
      });
      setQueryResult(result);
      toast.success(`Query executed: ${result.rowCount} rows returned`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Query execution failed');
      setQueryResult(null);
    } finally {
      setExecutingRaw(false);
    }
  };

  const handleExecuteQuery = async (query: Query) => {
    try {
      const result = await queriesAPI.execute(query.id);
      setSqlCode(query.sql);
      setQueryResult(result);
      setSelectedConnectionId(query.connection.id);
      toast.success(`Query executed: ${result.rowCount} rows returned`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Query execution failed');
      setQueryResult(null);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedConnectionId || !sqlCode.trim()) {
      toast.error('Please execute a query first');
      return;
    }

    setExporting('csv');
    try {
      await queriesAPI.exportCSV(selectedConnectionId, sqlCode, 'query-results');
      toast.success('CSV export started');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'CSV export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedConnectionId || !sqlCode.trim()) {
      toast.error('Please execute a query first');
      return;
    }

    setExporting('excel');
    try {
      await queriesAPI.exportExcel(selectedConnectionId, sqlCode, 'query-results');
      toast.success('Excel export started');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Excel export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleEdit = (query: Query) => {
    setEditingQuery(query);
    reset({
      name: query.name,
      description: query.description || '',
      sql: query.sql,
      connection: query.connection.id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openSaveModal = () => {
    setEditingQuery(null);
    reset({
      name: '',
      description: '',
      sql: sqlCode,
      connection: selectedConnectionId,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuery(null);
    reset();
  };

  const loadingState = queriesLoading || connectionsLoading;

  if (loadingState) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
              <FileCode className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="heading-2">SQL Queries</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Write and execute SQL queries
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
            <FileCode className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="heading-2">SQL Queries</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {queries.length} saved {queries.length === 1 ? 'query' : 'queries'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SQL Editor - Left Side (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Editor Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Query Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  options={connections.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.type})`,
                  }))}
                  value={selectedConnectionId}
                  onChange={(e) => setSelectedConnectionId(e.target.value)}
                  className="min-w-[200px]"
                />
                <Button
                  onClick={handleExecuteRaw}
                  isLoading={executingRaw}
                  leftIcon={<Play className="h-4 w-4" />}
                  size="sm"
                >
                  Run Query
                </Button>
                <Button
                  onClick={openSaveModal}
                  variant="secondary"
                  leftIcon={<Save className="h-4 w-4" />}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <CodeMirror
                value={sqlCode}
                height="400px"
                extensions={[sql()]}
                onChange={(value) => setSqlCode(value)}
                theme="dark"
                className="text-sm"
              />
            </CardBody>
          </Card>

          {/* Query Results Card */}
          {queryResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Query Results</CardTitle>
                    <Badge variant="success">
                      {queryResult.rowCount} {queryResult.rowCount === 1 ? 'row' : 'rows'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportCSV}
                      isLoading={exporting === 'csv'}
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportExcel}
                      isLoading={exporting === 'excel'}
                      leftIcon={<FileSpreadsheet className="h-4 w-4" />}
                    >
                      Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  {queryResult.rows.length > 0 ? (
                    <div className="max-h-[500px] overflow-auto">
                      <AdvancedTable data={queryResult.rows} />
                    </div>
                  ) : (
                    <div className="py-12">
                      <EmptyState
                        icon={<Database className="w-12 h-12" />}
                        title="No results"
                        description="Query executed successfully but returned no rows"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Saved Queries - Right Sidebar (1/3 width) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Queries</CardTitle>
            </CardHeader>
            <CardBody className="p-4 space-y-2 max-h-[800px] overflow-y-auto">
              {queries.length === 0 ? (
                <EmptyState
                  icon={<FileCode className="w-12 h-12" />}
                  title="No saved queries"
                  description="Save your queries for easy access later"
                />
              ) : (
                queries.map((query) => (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all cursor-pointer hover:shadow-md">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                            {query.name}
                          </h4>
                          {query.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                              {query.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Database className="h-3 w-3" />
                        <span className="truncate">{query.connection.name}</span>
                      </div>

                      {query.updatedAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-3">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(query.updatedAt)}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleExecuteQuery(query)}
                          className="flex-1 text-xs"
                        >
                          <Play className="h-3 w-3" />
                          Run
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(query)}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(query.id, query.name)}
                          className="text-error-600 hover:text-error-700"
                          isLoading={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <QueryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting || createMutation.isPending || updateMutation.isPending}
        isEditing={!!editingQuery}
        connections={connections}
        setValue={setValue}
      />
    </div>
  );
};

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  register: any;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
  connections: Connection[];
  setValue: any;
}

const QueryModal = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  errors,
  isSubmitting,
  isEditing,
  connections,
}: QueryModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Query' : 'Save Query'}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Query Name"
          placeholder="Monthly Sales Report"
          error={errors.name?.message}
          {...register('name')}
          required
        />

        <Textarea
          label="Description"
          placeholder="What does this query do?"
          error={errors.description?.message}
          {...register('description')}
          rows={2}
        />

        <Select
          label="Connection"
          error={errors.connection?.message}
          {...register('connection')}
          required
          options={connections.map((c) => ({
            value: c.id,
            label: `${c.name} (${c.type})`,
          }))}
        />

        <Textarea
          label="SQL Query"
          placeholder="SELECT * FROM users WHERE active = true;"
          error={errors.sql?.message}
          {...register('sql')}
          rows={8}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update Query' : 'Save Query'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QueriesPage;
