import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Type, List, ChevronDown } from 'lucide-react';
import Button from './Button';

export interface Filter {
  id: string;
  type: 'date' | 'text' | 'select';
  field: string;
  operator: string;
  value: any;
  label?: string;
}

interface FilterBuilderProps {
  filters: Filter[];
  onChange: (filters: Filter[]) => void;
  availableFields?: Array<{ value: string; label: string; type: string }>;
}

const OPERATORS = {
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'in', label: 'In' },
  ],
};

const FilterBuilder = ({ filters, onChange, availableFields = [] }: FilterBuilderProps) => {
  const [expanded, setExpanded] = useState(true);

  const addFilter = () => {
    const newFilter: Filter = {
      id: Math.random().toString(36).substring(7),
      type: 'text',
      field: availableFields[0]?.value || '',
      operator: 'equals',
      value: '',
    };
    onChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    onChange(
      filters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter((filter) => filter.id !== id));
  };

  const getOperatorsForType = (type: string) => {
    return OPERATORS[type as keyof typeof OPERATORS] || OPERATORS.text;
  };

  const renderFilterValue = (filter: Filter) => {
    switch (filter.type) {
      case 'date':
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="input flex-1"
          />
        );
      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="select flex-1"
          >
            <option value="">Select value</option>
            {/* Add dynamic options based on field */}
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
            className="input flex-1"
          />
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'date':
        return <Calendar size={16} />;
      case 'select':
        return <List size={16} />;
      default:
        return <Type size={16} />;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          {filters.length > 0 && (
            <span className="badge badge-primary">{filters.length}</span>
          )}
        </div>
        <Button
          onClick={addFilter}
          variant="outline"
          size="sm"
          icon={<Plus size={16} />}
        >
          Add Filter
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden"
          >
            {filters.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No filters applied</p>
                <p className="text-xs mt-1">
                  Add filters to refine dashboard data
                </p>
              </div>
            ) : (
              filters.map((filter, index) => (
                <motion.div
                  key={filter.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Field */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Field
                      </label>
                      {availableFields.length > 0 ? (
                        <select
                          value={filter.field}
                          onChange={(e) => {
                            const field = availableFields.find(
                              (f) => f.value === e.target.value
                            );
                            updateFilter(filter.id, {
                              field: e.target.value,
                              type: field?.type as any,
                            });
                          }}
                          className="select"
                        >
                          {availableFields.map((field) => (
                            <option key={field.value} value={field.value}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={filter.field}
                          onChange={(e) =>
                            updateFilter(filter.id, { field: e.target.value })
                          }
                          placeholder="Field name"
                          className="input"
                        />
                      )}
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {getTypeIcon(filter.type)}
                        </div>
                        <select
                          value={filter.type}
                          onChange={(e) =>
                            updateFilter(filter.id, {
                              type: e.target.value as any,
                              operator: 'equals',
                            })
                          }
                          className="select pl-9"
                        >
                          <option value="text">Text</option>
                          <option value="date">Date</option>
                          <option value="select">Select</option>
                        </select>
                      </div>
                    </div>

                    {/* Operator */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Operator
                      </label>
                      <select
                        value={filter.operator}
                        onChange={(e) =>
                          updateFilter(filter.id, { operator: e.target.value })
                        }
                        className="select"
                      >
                        {getOperatorsForType(filter.type).map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Value
                      </label>
                      {renderFilterValue(filter)}
                    </div>
                  </div>

                  {/* Remove button */}
                  <div className="pt-6">
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                      title="Remove filter"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBuilder;
