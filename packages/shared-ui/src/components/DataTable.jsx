import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { EmptyState } from './EmptyState.jsx';
import { Button } from './Button.jsx';

export function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  loading = false,
  error = null,
  onRetry,
  onRowClick,
  pageSize = 8,
  emptyTitle = 'No matching records',
  emptyDescription = 'Adjust your filters or add a new entry to populate this table.',
  emptyActionLabel,
  onEmptyAction,
  toolbar,
}) {
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    const col = columns.find((c) => c.key === sortConfig.key);
    return [...data].sort((a, b) => {
      const valA = col?.sortValue ? col.sortValue(a) : a[sortConfig.key];
      const valB = col?.sortValue ? col.sortValue(b) : b[sortConfig.key];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      const cmp =
        typeof valA === 'number' && typeof valB === 'number'
          ? valA - valB
          : String(valA).localeCompare(String(valB));
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortConfig, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const handleSort = (key) => {
    setPage(1);
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: 'asc' };
    });
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="mt-3 font-display text-sm font-semibold text-slate-900">
          Unable to load records
        </h3>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        {onRetry && (
          <div className="mt-4">
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {toolbar && (
        <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
          {toolbar}
        </div>
      )}

      {loading ? (
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
              <div className="h-4 w-28 rounded bg-slate-100" />
              <div className="h-4 flex-1 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : sortedData.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 whitespace-nowrap ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      } ${col.headerClassName || ''}`}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={`inline-flex items-center gap-1 font-medium hover:text-slate-800 cursor-pointer ${
                            col.align === 'right' ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <span>{col.header}</span>
                          <ArrowUpDown
                            className={`h-3 w-3 ${
                              sortConfig.key === col.key
                                ? 'text-cyan-600'
                                : 'text-slate-400'
                            }`}
                          />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.map((row, idx) => {
                  const keyVal =
                    typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? idx;
                  return (
                    <tr
                      key={keyVal}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={`transition-colors ${
                        onRowClick
                          ? 'cursor-pointer hover:bg-cyan-50/35'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-slate-700 ${
                            col.align === 'right'
                              ? 'text-right tabular-nums'
                              : 'text-left'
                          } ${col.cellClassName || ''}`}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/40 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:px-5">
            <span className="tabular-nums">
              Showing{' '}
              <span className="font-medium text-slate-700">
                {(safePage - 1) * pageSize + 1}
              </span>
              –
              <span className="font-medium text-slate-700">
                {Math.min(safePage * pageSize, sortedData.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-slate-700">
                {sortedData.length}
              </span>{' '}
              records
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <span className="px-2.5 font-medium text-slate-700 tabular-nums">
                Page {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
