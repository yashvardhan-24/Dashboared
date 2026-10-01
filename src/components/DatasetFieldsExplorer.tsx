import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Database,
  DollarSign,
  Hash,
  Calendar,
  Tag,
  Percent,
  Activity,
  BarChart3
} from 'lucide-react';
import type { DetectedColumn } from '../types/dashboard';
import { formatCurrency, formatCompactNumber } from '../utils/dataProcessor';

interface DatasetFieldsExplorerProps {
  columns: DetectedColumn[];
  data: Record<string, any>[];
  currencySymbol?: string;
}

interface FieldStats {
  sum?: number;
  avg?: number;
  min?: number;
  max?: number;
  uniqueCount?: number;
  topValues?: { label: string; count: number; pct: number }[];
  nonNullCount: number;
}

function computeStats(col: DetectedColumn, data: Record<string, any>[]): FieldStats {
  const colName = col.name;
  const isNumeric = col.type === 'currency' || col.type === 'number' || col.type === 'percentage';
  const nonNullValues = data.filter(r => r[colName] !== null && r[colName] !== undefined && r[colName] !== '');

  if (isNumeric) {
    const nums = nonNullValues
      .map(r => parseFloat(String(r[colName]).replace(/[$,%\s]/g, '')))
      .filter(v => !isNaN(v));
    if (nums.length === 0) return { nonNullCount: 0 };
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      sum,
      avg: sum / nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
      nonNullCount: nums.length
    };
  }

  // Category / text / id
  const freq: Record<string, number> = {};
  nonNullValues.forEach(r => {
    const v = String(r[colName] ?? '').trim();
    if (v) freq[v] = (freq[v] || 0) + 1;
  });
  const total = nonNullValues.length || 1;
  const topValues = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));

  return {
    uniqueCount: Object.keys(freq).length,
    topValues,
    nonNullCount: nonNullValues.length
  };
}

function getColIcon(col: DetectedColumn) {
  switch (col.type) {
    case 'currency':    return DollarSign;
    case 'number':      return Hash;
    case 'date':        return Calendar;
    case 'percentage':  return Percent;
    case 'id':          return Tag;
    case 'category':    return BarChart3;
    default:            return Activity;
  }
}

function getColColor(col: DetectedColumn): string {
  switch (col.type) {
    case 'currency':    return 'text-emerald-400 bg-emerald-950/50 border-emerald-500/20';
    case 'number':      return 'text-purple-400 bg-purple-950/50 border-purple-500/20';
    case 'date':        return 'text-blue-400 bg-blue-950/50 border-blue-500/20';
    case 'percentage':  return 'text-amber-400 bg-amber-950/50 border-amber-500/20';
    case 'id':          return 'text-gray-400 bg-gray-800/50 border-gray-600/20';
    case 'category':    return 'text-cyan-400 bg-cyan-950/50 border-cyan-500/20';
    default:            return 'text-gray-400 bg-gray-800/50 border-gray-600/20';
  }
}

function getRoleLabel(col: DetectedColumn): string | null {
  if (!col.suggestedRole || col.suggestedRole === 'none') return null;
  const labels: Record<string, string> = {
    date: 'Primary Date',
    revenue: 'Revenue',
    profit: 'Profit',
    expenses: 'Expenses',
    orders: 'Order Count',
    customer: 'Customer',
    product: 'Product',
    region: 'Region',
    category: 'Category',
    status: 'Status'
  };
  return labels[col.suggestedRole] || col.suggestedRole;
}

const FieldCard: React.FC<{
  col: DetectedColumn;
  stats: FieldStats;
  currencySymbol: string;
  totalRows: number;
}> = ({ col, stats, currencySymbol, totalRows }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = getColIcon(col);
  const colorClass = getColColor(col);
  const roleLabel = getRoleLabel(col);
  const isNumeric = col.type === 'currency' || col.type === 'number' || col.type === 'percentage';
  const displayName = col.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const fillPct = Math.round((stats.nonNullCount / Math.max(totalRows, 1)) * 100);

  const formatVal = (v: number) => {
    if (col.type === 'currency') return formatCurrency(v, currencySymbol);
    if (col.type === 'percentage') return `${v.toFixed(1)}%`;
    return formatCompactNumber(v);
  };

  return (
    <div className={`rounded-xl border bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden ${expanded ? 'border-white/20' : 'border-white/8'}`}>
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left cursor-pointer"
      >
        {/* Type icon */}
        <div className={`p-1.5 rounded-lg border flex-shrink-0 ${colorClass}`}>
          <Icon className="w-3 h-3" />
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-200 truncate">{displayName}</span>
            {roleLabel && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
                {roleLabel}
              </span>
            )}
          </div>
          {/* Fill bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${fillPct > 80 ? 'bg-emerald-500/60' : fillPct > 50 ? 'bg-amber-500/60' : 'bg-rose-500/60'}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-500 font-mono flex-shrink-0">{fillPct}% filled</span>
          </div>
        </div>

        {/* Primary stat */}
        <div className="text-right flex-shrink-0">
          {isNumeric && stats.sum !== undefined ? (
            <div>
              <div className="text-sm font-bold text-white">{formatVal(stats.sum)}</div>
              <div className="text-[9px] text-gray-500">total</div>
            </div>
          ) : stats.uniqueCount !== undefined ? (
            <div>
              <div className="text-sm font-bold text-white">{stats.uniqueCount}</div>
              <div className="text-[9px] text-gray-500">unique</div>
            </div>
          ) : null}
        </div>

        {/* Expand chevron */}
        <div className="text-gray-600 flex-shrink-0">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-white/5 pt-3 space-y-3">
          {/* Column metadata */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
              <span className="text-gray-600">type: </span>{col.type}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
              <span className="text-gray-600">records: </span>{stats.nonNullCount.toLocaleString()}
            </span>
            {col.nullCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-400">
                {col.nullCount} nulls
              </span>
            )}
            {col.uniqueValuesCount && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
                <span className="text-gray-600">unique values: </span>{col.uniqueValuesCount}
              </span>
            )}
          </div>

          {/* Numeric breakdown */}
          {isNumeric && stats.sum !== undefined && (
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Total', value: formatVal(stats.sum!) },
                { label: 'Average', value: formatVal(stats.avg!) },
                { label: 'Min', value: formatVal(stats.min!) },
                { label: 'Max', value: formatVal(stats.max!) }
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-white/[0.02] rounded-lg px-2 py-2 border border-white/5">
                  <div className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</div>
                  <div className="text-xs font-bold text-white mt-0.5 truncate" title={value}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Category top values */}
          {!isNumeric && stats.topValues && stats.topValues.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">Top values</div>
              {stats.topValues.map(({ label, count, pct }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-gray-300 font-medium truncate">{label}</span>
                      <span className="text-[10px] text-gray-500 font-mono ml-2 flex-shrink-0">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-500/50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sample values */}
          {col.sampleValues && col.sampleValues.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider w-full">Samples</span>
              {col.sampleValues.slice(0, 5).map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 font-mono">
                  {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const DatasetFieldsExplorer: React.FC<DatasetFieldsExplorerProps> = ({
  columns,
  data,
  currencySymbol = '$'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fieldStats = useMemo(() => {
    const stats: Record<string, FieldStats> = {};
    for (const col of columns) {
      stats[col.name] = computeStats(col, data);
    }
    return stats;
  }, [columns, data]);

  const typeGroups = useMemo(() => {
    const types = [...new Set(columns.map(c => c.type))];
    return types;
  }, [columns]);

  const filteredColumns = useMemo(() =>
    filter === 'all' ? columns : columns.filter(c => c.type === filter),
    [columns, filter]
  );

  const numericCount = columns.filter(c => c.type === 'currency' || c.type === 'number' || c.type === 'percentage').length;
  const categoryCount = columns.filter(c => c.type === 'category' || c.type === 'text' || c.type === 'id').length;

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-all cursor-pointer"
      >
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Database className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Dataset Fields</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-gray-400 font-mono border border-white/10">
              {columns.length} columns
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {numericCount} numeric · {categoryCount} categorical · {data.length.toLocaleString()} rows
          </p>
        </div>

        {/* Type pill summary */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          {typeGroups.slice(0, 4).map(type => (
            <span key={type} className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getColColor({ type } as DetectedColumn)}`}>
              {type}
            </span>
          ))}
          {typeGroups.length > 4 && (
            <span className="text-[9px] text-gray-600">+{typeGroups.length - 4}</span>
          )}
        </div>

        <div className="text-gray-600">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-white/8 px-4 pt-3 pb-4">
          {/* Type filter tabs */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              All ({columns.length})
            </button>
            {typeGroups.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  filter === type
                    ? `border ${getColColor({ type } as DetectedColumn)}`
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {type} ({columns.filter(c => c.type === type).length})
              </button>
            ))}
          </div>

          {/* Field cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {filteredColumns.map(col => (
              <FieldCard
                key={col.name}
                col={col}
                stats={fieldStats[col.name] || { nonNullCount: 0 }}
                currencySymbol={currencySymbol}
                totalRows={data.length}
              />
            ))}
          </div>

          {filteredColumns.length === 0 && (
            <div className="text-center py-6 text-gray-600 text-sm">No fields of type "{filter}"</div>
          )}
        </div>
      )}
    </div>
  );
};
