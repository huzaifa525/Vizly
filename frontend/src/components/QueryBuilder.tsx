import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Table, Filter, SortAsc, FileCode, Copy } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

interface QueryBuilderProps {
  onQueryGenerated: (sql: string) => void;
  connectionId?: string;
  availableTables?: Array<{ name: string; columns: Array<{ name: string; type: string }> }>;
}

interface SelectColumn {
  id: string;
  table: string;
  column: string;
  alias?: string;
  aggregate?: string;
}

interface WhereCondition {
  id: string;
  table: string;
  column: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface OrderByClause {
  id: string;
  table: string;
  column: string;
  direction: 'ASC' | 'DESC';
}

const AGGREGATES = ['', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

const QueryBuilder = ({ onQueryGenerated, connectionId, availableTables = [] }: QueryBuilderProps) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectColumns, setSelectColumns] = useState<SelectColumn[]>([]);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [orderByClauses, setOrderByClauses] = useState<OrderByClause[]>([]);
  const [limit, setLimit] = useState<string>('');
  const [generatedSQL, setGeneratedSQL] = useState<string>('');

  useEffect(() => {
    generateSQL();
  }, [selectedTables, selectColumns, whereConditions, orderByClauses, limit]);

  const generateSQL = () => {
    if (selectColumns.length === 0 || selectedTables.length === 0) {
      setGeneratedSQL('');
      return;
    }

    // SELECT clause
    const selectPart = selectColumns
      .map((col) => {
        const columnExpr = col.aggregate
          ? `${col.aggregate}(${col.table}.${col.column})`
          : `${col.table}.${col.column}`;
        return col.alias ? `${columnExpr} AS ${col.alias}` : columnExpr;
      })
      .join(', ');

    // FROM clause
    const fromPart = selectedTables.join(', ');

    // WHERE clause
    let wherePart = '';
    if (whereConditions.length > 0) {
      const conditions = whereConditions.map((cond, index) => {
        let condStr = `${cond.table}.${cond.column} ${cond.operator}`;
        if (!['IS NULL', 'IS NOT NULL'].includes(cond.operator)) {
          condStr += ` '${cond.value}'`;
        }
        if (index > 0) {
          condStr = `${cond.logicalOperator || 'AND'} ${condStr}`;
        }
        return condStr;
      });
      wherePart = `\nWHERE ${conditions.join('\n  ')}`;
    }

    // ORDER BY clause
    let orderByPart = '';
    if (orderByClauses.length > 0) {
      const orderClauses = orderByClauses.map(
        (order) => `${order.table}.${order.column} ${order.direction}`
      );
      orderByPart = `\nORDER BY ${orderClauses.join(', ')}`;
    }

    // LIMIT clause
    const limitPart = limit ? `\nLIMIT ${limit}` : '';

    const sql = `SELECT ${selectPart}\nFROM ${fromPart}${wherePart}${orderByPart}${limitPart}`;
    setGeneratedSQL(sql);
    onQueryGenerated(sql);
  };

  const addSelectColumn = () => {
    if (selectedTables.length === 0) {
      toast.error('Please select a table first');
      return;
    }

    const firstTable = selectedTables[0];
    const tableSchema = availableTables.find((t) => t.name === firstTable);
    const firstColumn = tableSchema?.columns[0]?.name || 'id';

    setSelectColumns([
      ...selectColumns,
      {
        id: Math.random().toString(36).substring(7),
        table: firstTable,
        column: firstColumn,
        aggregate: '',
      },
    ]);
  };

  const updateSelectColumn = (id: string, updates: Partial<SelectColumn>) => {
    setSelectColumns(
      selectColumns.map((col) => (col.id === id ? { ...col, ...updates } : col))
    );
  };

  const removeSelectColumn = (id: string) => {
    setSelectColumns(selectColumns.filter((col) => col.id !== id));
  };

  const addWhereCondition = () => {
    if (selectedTables.length === 0) {
      toast.error('Please select a table first');
      return;
    }

    const firstTable = selectedTables[0];
    const tableSchema = availableTables.find((t) => t.name === firstTable);
    const firstColumn = tableSchema?.columns[0]?.name || 'id';

    setWhereConditions([
      ...whereConditions,
      {
        id: Math.random().toString(36).substring(7),
        table: firstTable,
        column: firstColumn,
        operator: '=',
        value: '',
        logicalOperator: whereConditions.length > 0 ? 'AND' : undefined,
      },
    ]);
  };

  const updateWhereCondition = (id: string, updates: Partial<WhereCondition>) => {
    setWhereConditions(
      whereConditions.map((cond) => (cond.id === id ? { ...cond, ...updates } : cond))
    );
  };

  const removeWhereCondition = (id: string) => {
    setWhereConditions(whereConditions.filter((cond) => cond.id !== id));
  };

  const addOrderBy = () => {
    if (selectedTables.length === 0) {
      toast.error('Please select a table first');
      return;
    }

    const firstTable = selectedTables[0];
    const tableSchema = availableTables.find((t) => t.name === firstTable);
    const firstColumn = tableSchema?.columns[0]?.name || 'id';

    setOrderByClauses([
      ...orderByClauses,
      {
        id: Math.random().toString(36).substring(7),
        table: firstTable,
        column: firstColumn,
        direction: 'ASC',
      },
    ]);
  };

  const updateOrderBy = (id: string, updates: Partial<OrderByClause>) => {
    setOrderByClauses(
      orderByClauses.map((order) => (order.id === id ? { ...order, ...updates } : order))
    );
  };

  const removeOrderBy = (id: string) => {
    setOrderByClauses(orderByClauses.filter((order) => order.id !== id));
  };

  const getColumnsForTable = (tableName: string) => {
    const table = availableTables.find((t) => t.name === tableName);
    return table?.columns || [];
  };

  const copySQL = () => {
    navigator.clipboard.writeText(generatedSQL);
    toast.success('SQL copied to clipboard');
  };

  return (
    <div className="space-y-4">
      {/* Tables Selection */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Table size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tables</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableTables.map((table) => {
            const isSelected = selectedTables.includes(table.name);
            return (
              <button
                key={table.name}
                onClick={() => {
                  if (isSelected) {
                    setSelectedTables(selectedTables.filter((t) => t !== table.name));
                    // Remove columns from deselected table
                    setSelectColumns(selectColumns.filter((col) => col.table !== table.name));
                    setWhereConditions(whereConditions.filter((cond) => cond.table !== table.name));
                    setOrderByClauses(orderByClauses.filter((order) => order.table !== table.name));
                  } else {
                    setSelectedTables([...selectedTables, table.name]);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {table.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECT Columns */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileCode size={20} className="text-success-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              SELECT Columns
            </h3>
          </div>
          <Button onClick={addSelectColumn} variant="outline" size="sm" icon={<Plus size={16} />}>
            Add Column
          </Button>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {selectColumns.map((col, index) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <select
                  value={col.table}
                  onChange={(e) => updateSelectColumn(col.id, { table: e.target.value })}
                  className="select col-span-3"
                >
                  {selectedTables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>

                <select
                  value={col.column}
                  onChange={(e) => updateSelectColumn(col.id, { column: e.target.value })}
                  className="select col-span-3"
                >
                  {getColumnsForTable(col.table).map((column) => (
                    <option key={column.name} value={column.name}>
                      {column.name}
                    </option>
                  ))}
                </select>

                <select
                  value={col.aggregate || ''}
                  onChange={(e) => updateSelectColumn(col.id, { aggregate: e.target.value })}
                  className="select col-span-2"
                >
                  <option value="">No Aggregate</option>
                  {AGGREGATES.slice(1).map((agg) => (
                    <option key={agg} value={agg}>
                      {agg}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={col.alias || ''}
                  onChange={(e) => updateSelectColumn(col.id, { alias: e.target.value })}
                  placeholder="Alias (optional)"
                  className="input col-span-3"
                />

                <button
                  onClick={() => removeSelectColumn(col.id)}
                  className="col-span-1 p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* WHERE Conditions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-warning-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              WHERE Conditions
            </h3>
          </div>
          <Button onClick={addWhereCondition} variant="outline" size="sm" icon={<Plus size={16} />}>
            Add Condition
          </Button>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {whereConditions.map((cond, index) => (
              <motion.div
                key={cond.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {index > 0 && (
                  <select
                    value={cond.logicalOperator}
                    onChange={(e) =>
                      updateWhereCondition(cond.id, { logicalOperator: e.target.value as any })
                    }
                    className="select w-32"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}
                <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <select
                    value={cond.table}
                    onChange={(e) => updateWhereCondition(cond.id, { table: e.target.value })}
                    className="select col-span-3"
                  >
                    {selectedTables.map((table) => (
                      <option key={table} value={table}>
                        {table}
                      </option>
                    ))}
                  </select>

                  <select
                    value={cond.column}
                    onChange={(e) => updateWhereCondition(cond.id, { column: e.target.value })}
                    className="select col-span-3"
                  >
                    {getColumnsForTable(cond.table).map((column) => (
                      <option key={column.name} value={column.name}>
                        {column.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={cond.operator}
                    onChange={(e) => updateWhereCondition(cond.id, { operator: e.target.value })}
                    className="select col-span-2"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) => updateWhereCondition(cond.id, { value: e.target.value })}
                    placeholder="Value"
                    disabled={['IS NULL', 'IS NOT NULL'].includes(cond.operator)}
                    className="input col-span-3"
                  />

                  <button
                    onClick={() => removeWhereCondition(cond.id)}
                    className="col-span-1 p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ORDER BY */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SortAsc size={20} className="text-info-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ORDER BY</h3>
          </div>
          <Button onClick={addOrderBy} variant="outline" size="sm" icon={<Plus size={16} />}>
            Add Sort
          </Button>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {orderByClauses.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <select
                  value={order.table}
                  onChange={(e) => updateOrderBy(order.id, { table: e.target.value })}
                  className="select col-span-4"
                >
                  {selectedTables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>

                <select
                  value={order.column}
                  onChange={(e) => updateOrderBy(order.id, { column: e.target.value })}
                  className="select col-span-4"
                >
                  {getColumnsForTable(order.table).map((column) => (
                    <option key={column.name} value={column.name}>
                      {column.name}
                    </option>
                  ))}
                </select>

                <select
                  value={order.direction}
                  onChange={(e) => updateOrderBy(order.id, { direction: e.target.value as any })}
                  className="select col-span-3"
                >
                  <option value="ASC">ASC</option>
                  <option value="DESC">DESC</option>
                </select>

                <button
                  onClick={() => removeOrderBy(order.id)}
                  className="col-span-1 p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* LIMIT */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">LIMIT:</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="No limit"
            className="input w-32"
            min="1"
          />
        </div>
      </div>

      {/* Generated SQL */}
      {generatedSQL && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated SQL
            </h3>
            <Button onClick={copySQL} variant="outline" size="sm" icon={<Copy size={16} />}>
              Copy
            </Button>
          </div>
          <pre className="p-4 bg-gray-900 dark:bg-gray-950 rounded-lg text-green-400 font-mono text-sm overflow-x-auto">
            {generatedSQL}
          </pre>
        </div>
      )}
    </div>
  );
};

export default QueryBuilder;
