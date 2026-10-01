import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import type { DetectedColumn } from '../types/dashboard';

interface GlobalFilterPanelProps {
  categoricalColumns: DetectedColumn[];
  datasetData: Record<string, any>[];
  activeCategoricalFilters: Record<string, string[]>;
  onFilterChange: (columnName: string, selectedValues: string[]) => void;
  onResetFilters: () => void;
}

export const GlobalFilterPanel: React.FC<GlobalFilterPanelProps> = ({
  categoricalColumns,
  datasetData,
  activeCategoricalFilters,
  onFilterChange,
  onResetFilters
}) => {
  // Only display columns with < 30 unique values
  const filterableCols = categoricalColumns.filter(
    c => c.type === 'category' || (c.uniqueValuesCount > 1 && c.uniqueValuesCount <= 30)
  );

  if (filterableCols.length === 0) return null;

  const totalActiveFiltersCount = Object.values(activeCategoricalFilters).reduce(
    (acc, arr) => acc + (arr ? arr.length : 0),
    0
  );

  return (
    <div className="w-full glass-panel rounded-2xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3 mb-6 transition-all">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 font-semibold text-xs border border-cyan-500/20">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {totalActiveFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center">
              {totalActiveFiltersCount}
            </span>
          )}
        </div>

        {filterableCols.map(col => {
          // Extract unique options from data
          const options = Array.from(
            new Set(datasetData.map(r => String(r[col.name] || '')).filter(Boolean))
          ).sort();

          const currentSelected = activeCategoricalFilters[col.name] || [];

          return (
            <div key={col.name} className="relative">
              <select
                value={currentSelected.length === 1 ? currentSelected[0] : 'ALL'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'ALL') {
                    onFilterChange(col.name, []);
                  } else {
                    onFilterChange(col.name, [val]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer focus:outline-none ${
                  currentSelected.length > 0
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                    : 'bg-gray-900/60 text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                <option value="ALL">{col.name}: All</option>
                {options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {totalActiveFiltersCount > 0 && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium px-2.5 py-1 rounded-xl bg-red-950/30 border border-red-500/20 hover:bg-red-950/50 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};
