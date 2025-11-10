import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';

interface AdvancedTableProps {
  data: any[];
  config?: any;
}

const AdvancedTable = ({ data, config }: AdvancedTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Generate columns from data
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys.map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info: any) => {
        const value = info.getValue();
        // Format numbers with commas
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        // Format dates
        if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('-'))) {
          try {
            return new Date(value).toLocaleDateString();
          } catch {
            return value;
          }
        }
        return value;
      },
    }));
  }, [data]);

  // Filter data based on column filters
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((row) => {
      // Apply global filter
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase();
        const matchesGlobal = Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        );
        if (!matchesGlobal) return false;
      }

      // Apply column filters
      for (const [key, filterValue] of Object.entries(columnFilters)) {
        if (filterValue) {
          const cellValue = String(row[key]).toLowerCase();
          if (!cellValue.includes(filterValue.toLowerCase())) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, globalFilter, columnFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: config?.pageSize || 10,
      },
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Global Search */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search across all columns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredData.length} {filteredData.length === 1 ? 'row' : 'rows'}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    <div className="flex flex-col gap-1">
                      <div
                        className="flex items-center gap-2 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="text-gray-400">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp size={16} />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronsUpDown size={16} />
                          )}
                        </span>
                      </div>
                      {/* Column Filter */}
                      <input
                        type="text"
                        value={columnFilters[header.column.id] || ''}
                        onChange={(e) => {
                          setColumnFilters((prev) => ({
                            ...prev,
                            [header.column.id]: e.target.value,
                          }));
                        }}
                        placeholder="Filter..."
                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {[10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTable;
