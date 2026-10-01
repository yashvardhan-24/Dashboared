import React, { useMemo } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Table2,
  X,
  Zap,
  Hash,
  Activity
} from 'lucide-react';
import type { CalculatedKPI, DetectedColumn } from '../types/dashboard';
import { formatCurrency, formatCompactNumber, formatPercentage } from '../utils/dataProcessor';

interface SearchResultsPanelProps {
  query: string;
  kpis: CalculatedKPI[];
  columns: DetectedColumn[];
  filteredData: Record<string, any>[];
  currencySymbol?: string;
  onClose: () => void;
}

// Split a column name into tokens: "active_accounts" → ["active", "accounts"]
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[_\-\s]+/g, ' ').split(' ').filter(Boolean);
}

// Looser single-token match: any query token appears in any column token
function looseTokenMatch(colName: string, query: string): boolean {
  const colTokens = tokenize(colName);
  const qTokens = tokenize(query);
  return qTokens.some(qt => colTokens.some(ct => ct.includes(qt) || qt.includes(ct)));
}

// Keyword → KPI label/id semantic aliases
const METRIC_KEYWORDS: Record<string, string[]> = {
  revenue:    ['revenue', 'sales', 'income', 'gmv', 'turnover', 'gross', 'mrr', 'arr', 'recurring'],
  profit:     ['profit', 'margin', 'net', 'earnings', 'ebitda'],
  orders:     ['orders', 'transactions', 'purchases', 'invoice', 'count', 'volume'],
  customers:  ['customers', 'users', 'clients', 'accounts', 'subscribers', 'unique', 'active'],
  expenses:   ['expenses', 'cost', 'costs', 'opex', 'spend', 'spending', 'operational'],
  conversion: ['conversion', 'rate', 'ctr', 'ratio', 'percent', 'score', 'satisfaction'],
  growth:     ['growth', 'trend', 'increase', 'decrease', 'change', 'new'],
};

function matchesQueryKPI(text: string, query: string): boolean {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  // Direct substring
  if (t.includes(q)) return true;
  // Token-level match
  if (looseTokenMatch(t, q)) return true;
  // Semantic keyword match
  for (const [, aliases] of Object.entries(METRIC_KEYWORDS)) {
    const labelMatches = aliases.some(a => t.includes(a));
    const queryMatches = aliases.some(a => q.includes(a) || a.includes(q));
    if (labelMatches && queryMatches) return true;
  }
  return false;
}

function matchesQueryColumn(colName: string, query: string): boolean {
  const q = query.toLowerCase().trim();
  // Direct substring (works for full names like "revenue")
  if (colName.toLowerCase().includes(q)) return true;
  // Token-level match: "active" → "active_accounts", "past" → "past_players"
  if (looseTokenMatch(colName, q)) return true;
  // Semantic keyword match
  for (const [, aliases] of Object.entries(METRIC_KEYWORDS)) {
    const colMatches = aliases.some(a => colName.toLowerCase().includes(a));
    const queryMatches = aliases.some(a => q.includes(a) || a.includes(q));
    if (colMatches && queryMatches) return true;
  }
  return false;
}

function getKpiIcon(id: string) {
  const t = id.toLowerCase();
  if (t.includes('revenue') || t.includes('sales') || t.includes('mrr') || t.includes('arr')) return DollarSign;
  if (t.includes('order') || t.includes('transaction') || t.includes('purchase')) return ShoppingBag;
  if (t.includes('customer') || t.includes('user') || t.includes('subscriber') || t.includes('account')) return Users;
  if (t.includes('profit') || t.includes('margin') || t.includes('earning')) return TrendingUp;
  if (t.includes('score') || t.includes('rate') || t.includes('satisfaction')) return Activity;
  return BarChart2;
}

function getColIcon(col: DetectedColumn) {
  const t = col.name.toLowerCase();
  if (col.type === 'currency' || t.includes('revenue') || t.includes('cost') || t.includes('billing')) return DollarSign;
  if (col.type === 'number' && (t.includes('count') || t.includes('order') || t.includes('qty'))) return ShoppingBag;
  if (t.includes('customer') || t.includes('user') || t.includes('patient') || t.includes('account') || t.includes('subscriber') || t.includes('player')) return Users;
  if (col.type === 'percentage' || t.includes('rate') || t.includes('score') || t.includes('margin')) return Activity;
  return Hash;
}

// Compute column aggregate stats from data
interface ColStats {
  sum: number;
  avg: number;
  min: number;
  max: number;
  count: number;
  topCategories?: { label: string; count: number }[];
}

function computeColStats(colName: string, col: DetectedColumn, data: Record<string, any>[]): ColStats | null {
  const isNumeric = col.type === 'currency' || col.type === 'number' || col.type === 'percentage';
  const isCategory = col.type === 'category' || col.type === 'text' || col.type === 'id';

  if (isNumeric) {
    const values = data
      .map(r => parseFloat(String(r[colName] ?? '').replace(/[$,%]/g, '')))
      .filter(v => !isNaN(v));
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      sum,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  if (isCategory) {
    const freq: Record<string, number> = {};
    data.forEach(r => {
      const v = String(r[colName] ?? '');
      if (v && v !== 'undefined') freq[v] = (freq[v] || 0) + 1;
    });
    const topCats = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));
    return { sum: 0, avg: 0, min: 0, max: 0, count: data.length, topCategories: topCats };
  }

  return null;
}

export const SearchResultsPanel: React.FC<SearchResultsPanelProps> = ({
  query,
  kpis,
  columns,
  filteredData,
  currencySymbol = '$',
  onClose
}) => {
  const q = query.trim();

  // 1. Match KPIs by label/id
  const matchedKpis = useMemo(() =>
    kpis.filter(kpi => matchesQueryKPI(kpi.label, q) || matchesQueryKPI(kpi.id, q)),
    [kpis, q]
  );

  // 2. Match columns by name with token matching
  const matchedColumns = useMemo(() =>
    columns.filter(col => matchesQueryColumn(col.name, q)),
    [columns, q]
  );

  // 3. Compute aggregate stats for matched numeric/category columns
  const columnStats = useMemo(() => {
    const stats: Record<string, ColStats | null> = {};
    for (const col of matchedColumns) {
      stats[col.name] = computeColStats(col.name, col, filteredData);
    }
    return stats;
  }, [matchedColumns, filteredData]);

  // 4. Match data rows by cell value (only for non-numeric queries — avoids flooding results)
  const isNumericQuery = /^\d+/.test(q);
  const matchedRows = useMemo(() => {
    if (!q || isNumericQuery) return [];
    return filteredData
      .filter(row =>
        Object.values(row).some(v =>
          String(v ?? '').toLowerCase().includes(q.toLowerCase())
        )
      )
      .slice(0, 6);
  }, [filteredData, q, isNumericQuery]);

  const hasResults = matchedKpis.length > 0 || matchedColumns.length > 0 || matchedRows.length > 0;

  if (!q) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-50 max-w-2xl mx-auto">
      <div className="glass-panel border border-white/15 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Smart Search
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">
              "{q}"
            </span>
            {hasResults && (
              <span className="text-[10px] text-gray-600">
                {matchedKpis.length + matchedColumns.length + matchedRows.length} results
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-[460px] overflow-y-auto divide-y divide-white/5">

          {/* ── KPI Metrics Section ── */}
          {matchedKpis.length > 0 && (
            <div className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-1 flex items-center gap-1.5">
                <BarChart2 className="w-3 h-3" /> Dashboard KPIs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedKpis.map(kpi => {
                  const Icon = getKpiIcon(kpi.id);
                  const isPos = (kpi.growthPercentage ?? 0) >= 0;
                  let val = '';
                  if (kpi.format === 'currency') val = formatCurrency(kpi.currentValue, currencySymbol);
                  else if (kpi.format === 'percentage') val = `${kpi.currentValue.toFixed(1)}%`;
                  else val = formatCompactNumber(kpi.currentValue);

                  let prevVal = '';
                  if (kpi.format === 'currency') prevVal = formatCurrency(kpi.previousValue, currencySymbol);
                  else if (kpi.format === 'percentage') prevVal = `${kpi.previousValue.toFixed(1)}%`;
                  else prevVal = formatCompactNumber(kpi.previousValue);

                  return (
                    <div
                      key={kpi.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                    >
                      <div className="p-2 rounded-xl bg-gray-900/80 border border-white/10 text-cyan-400 flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">{kpi.label}</div>
                        <div className="text-xl font-extrabold text-white tracking-tight">{val}</div>
                        <div className={`flex items-center gap-1 text-[10px] font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {formatPercentage(kpi.growthPercentage ?? 0)} vs prev ({prevVal})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Matched Columns with Live Aggregate Stats ── */}
          {matchedColumns.length > 0 && (
            <div className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-1 flex items-center gap-1.5">
                <Table2 className="w-3 h-3" /> Data Field Analysis
              </div>
              <div className="space-y-2">
                {matchedColumns.map(col => {
                  const stats = columnStats[col.name];
                  const isNumeric = col.type === 'currency' || col.type === 'number' || col.type === 'percentage';
                  const Icon = getColIcon(col);
                  const displayName = col.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                  return (
                    <div
                      key={col.name}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all"
                    >
                      {/* Column header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-gray-900/80 border border-white/10 text-purple-400 flex-shrink-0">
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-xs text-gray-200">{displayName}</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ml-auto flex-shrink-0 ${
                          col.type === 'currency'   ? 'bg-emerald-900/60 text-emerald-400' :
                          col.type === 'date'       ? 'bg-blue-900/60 text-blue-400' :
                          col.type === 'number'     ? 'bg-purple-900/60 text-purple-400' :
                          col.type === 'percentage' ? 'bg-amber-900/60 text-amber-400' :
                                                      'bg-gray-800 text-gray-400'
                        }`}>
                          {col.type}
                        </span>
                        {col.suggestedRole && col.suggestedRole !== 'none' && (
                          <span className="text-[10px] text-cyan-400 font-mono flex-shrink-0">• {col.suggestedRole}</span>
                        )}
                      </div>

                      {/* Numeric stats */}
                      {isNumeric && stats && (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Total', value: col.type === 'currency' ? formatCurrency(stats.sum, currencySymbol) : col.type === 'percentage' ? `${stats.avg.toFixed(1)}%` : formatCompactNumber(stats.sum) },
                            { label: 'Average', value: col.type === 'currency' ? formatCurrency(stats.avg, currencySymbol) : col.type === 'percentage' ? `${stats.avg.toFixed(1)}%` : formatCompactNumber(stats.avg) },
                            { label: 'Min', value: col.type === 'currency' ? formatCurrency(stats.min, currencySymbol) : formatCompactNumber(stats.min) },
                            { label: 'Max', value: col.type === 'currency' ? formatCurrency(stats.max, currencySymbol) : formatCompactNumber(stats.max) },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center bg-white/[0.02] rounded-lg px-2 py-1.5 border border-white/5">
                              <div className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</div>
                              <div className="text-xs font-bold text-white mt-0.5">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Category top values */}
                      {!isNumeric && stats?.topCategories && stats.topCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {stats.topCategories.map(({ label, count }) => (
                            <div key={label} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/8 text-[10px]">
                              <span className="text-gray-300 font-medium">{label}</span>
                              <span className="text-gray-600 font-mono">×{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Matched Data Rows ── */}
          {matchedRows.length > 0 && (
            <div className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-1 flex items-center gap-1.5">
                <Table2 className="w-3 h-3" /> Matching Records
                <span className="ml-auto font-normal text-gray-600 normal-case text-[10px]">
                  {matchedRows.length} shown
                </span>
              </div>
              <div className="space-y-1">
                {matchedRows.map((row, i) => {
                  const entries = Object.entries(row).slice(0, 5);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-xs"
                    >
                      <span className="text-gray-600 font-mono text-[10px] w-4 flex-shrink-0">#{i + 1}</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 min-w-0">
                        {entries.map(([k, v]) => (
                          <span key={k} className="flex items-center gap-1">
                            <span className="text-gray-500 text-[10px]">{k.replace(/_/g, ' ')}:</span>
                            <span className={`font-medium ${
                              String(v).toLowerCase().includes(q.toLowerCase())
                                ? 'text-cyan-300'
                                : 'text-gray-300'
                            }`}>
                              {String(v ?? '—')}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── No Results ── */}
          {!hasResults && (
            <div className="p-6 text-center space-y-3">
              <div className="text-3xl">🔍</div>
              <p className="text-sm font-semibold text-gray-300">No matches for "{q}"</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Try searching a field name from your data (e.g. <span className="text-cyan-500 font-mono">active_accounts</span>, <span className="text-cyan-500 font-mono">revenue</span>, <span className="text-cyan-500 font-mono">profit</span>) or a value like a region, product or customer name.
              </p>
            </div>
          )}

          {/* ── Footer ── */}
          {hasResults && (
            <div className="px-4 py-2 bg-white/[0.01] flex items-center justify-between">
              <span className="text-[10px] text-gray-600">Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[9px]">Esc</kbd> or ✕ to close</span>
              {matchedRows.length === 6 && (
                <span className="text-[10px] text-cyan-700">Showing top 6 — scroll the data table for more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
