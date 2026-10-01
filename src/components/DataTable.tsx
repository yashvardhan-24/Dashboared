import React, { useState } from 'react';
import { Table, Search, ChevronLeft, ChevronRight, Download, ArrowUpDown, Plus, Edit2, Trash2 } from 'lucide-react';
import type { DetectedColumn } from '../types/dashboard';
import { exportToCSV } from '../utils/exportUtils';

interface DataTableProps {
  data: Record<string, any>[];
  columns: DetectedColumn[];
  datasetName: string;
  onAddRecord?: () => void;
  onEditRecord?: (row: Record<string, any>) => void;
  onDeleteRecord?: (row: Record<string, any>) => void;
  onBulkDelete?: (rows: Record<string, any>[]) => void;
  activeRole?: 'Admin' | 'Manager' | 'Viewer';
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  datasetName,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onBulkDelete,
  activeRole = 'Admin'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);

  if (data.length === 0) return null;

  const visibleCols = columns.length > 0 ? columns.map(c => c.name) : Object.keys(data[0]);

  // Filter & Sort Data
  let processed = [...data];
  if (tableSearch.trim()) {
    const q = tableSearch.toLowerCase();
    processed = processed.filter(row =>
      Object.values(row).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(q))
    );
  }

  if (sortCol) {
    processed.sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  // Pagination Math
  const totalPages = Math.ceil(processed.length / pageSize);
  const paginatedRows = processed.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colName);
      setSortDir('asc');
    }
  };

  const isRowSelected = (row: Record<string, any>) => selectedRows.includes(row);

  const toggleSelectRow = (row: Record<string, any>) => {
    if (isRowSelected(row)) {
      setSelectedRows(selectedRows.filter(r => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const toggleSelectAllPage = () => {
    const allSelected = paginatedRows.every(r => isRowSelected(r));
    if (allSelected) {
      setSelectedRows(selectedRows.filter(r => !paginatedRows.includes(r)));
    } else {
      const newSel = [...selectedRows];
      paginatedRows.forEach(r => {
        if (!newSel.includes(r)) newSel.push(r);
      });
      setSelectedRows(newSel);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Filtered Raw Data Matrix</h3>
            <p className="text-xs text-gray-400">
              Showing {processed.length.toLocaleString()} matching records
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Table Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search table rows..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {onAddRecord && activeRole !== 'Viewer' && (
            <button
              onClick={onAddRecord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          )}

          <button
            onClick={() => exportToCSV(processed, `${datasetName}_filtered_table.csv`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-4 text-xs">
          <span className="font-semibold text-purple-300">
            {selectedRows.length} rows selected
          </span>
          <div className="flex items-center gap-2">
            {onBulkDelete && (
              <button
                onClick={() => {
                  onBulkDelete(selectedRows);
                  setSelectedRows([]);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            )}
            <button
              onClick={() => setSelectedRows([])}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Table View */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 max-h-96">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-md text-gray-300 font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={paginatedRows.length > 0 && paginatedRows.every(r => isRowSelected(r))}
                  onChange={toggleSelectAllPage}
                  className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </th>
              {visibleCols.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 cursor-pointer hover:text-cyan-300 transition-colors uppercase font-mono text-[11px] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col}</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-200">
            {paginatedRows.map((row, rIdx) => (
              <tr key={rIdx} className={`hover:bg-white/5 transition-colors font-mono text-[11px] ${isRowSelected(row) ? 'bg-purple-950/20' : ''}`}>
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={isRowSelected(row)}
                    onChange={() => toggleSelectRow(row)}
                    className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                </td>
                {visibleCols.map(col => (
                  <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-gray-600">-</span>}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {onEditRecord && (
                      <button
                        onClick={() => onEditRecord(row)}
                        className="p-1 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteRecord && (
                      <button
                        onClick={() => onDeleteRecord(row)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-gray-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
          >
            {[10, 25, 50, 100].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg bg-gray-900/80 border border-white/10 disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg bg-gray-900/80 border border-white/10 disabled:opacity-40 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

