import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import type { AggregationTimeSeriesPoint, AggregationPeriod, FieldMapping } from '../types/dashboard';
import { formatCompactNumber, formatCurrency } from '../utils/dataProcessor';
import { generatePredictiveForecast } from '../utils/aiProcessor';
import { BarChart2, LineChart } from 'lucide-react';

interface RevenueChartCardProps {
  data: AggregationTimeSeriesPoint[];
  mapping: FieldMapping;
  period: AggregationPeriod;
  onPeriodChange: (p: AggregationPeriod) => void;
  currencySymbol?: string;
  onChartClick?: (point: AggregationTimeSeriesPoint) => void;
}

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({
  data,
  mapping,
  period,
  onPeriodChange,
  currencySymbol = '$',
  onChartClick
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [showForecast, setShowForecast] = useState<boolean>(false);
  const [activeSeries, setActiveSeries] = useState<{
    revenue: boolean;
    expenses: boolean;
    profit: boolean;
  }>({
    revenue: true,
    expenses: Boolean(mapping.expenseField),
    profit: Boolean(mapping.profitField)
  });

  if (data.length === 0) return null;

  // Custom Glass Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3.5 rounded-2xl border border-white/20 shadow-2xl space-y-2 text-xs font-sans min-w-[160px]">
          <p className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-cyan-400 font-mono">Period Overview</span>
          </p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="capitalize">{entry.name}:</span>
              </span>
              <span className="font-bold text-white font-mono">
                {entry.name === 'orders' ? entry.value.toLocaleString() : formatCurrency(entry.value, currencySymbol)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl mb-6 space-y-4">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg tracking-tight">Financial & Revenue Trend</h3>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] uppercase font-bold border border-cyan-500/20">
              Primary Chart
            </span>
          </div>
          <p className="text-xs text-gray-400">Time-series aggregation over selected reporting window</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* AI Forecast Toggle Button */}
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              showForecast
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/10'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            AI Forecast {showForecast ? 'ON' : 'OFF'}
          </button>

          {/* Chart View Type Switcher */}
          <div className="flex items-center bg-gray-900/80 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'area' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-white'
              }`}
              title="Area Chart"
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'bar' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-white'
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Granularity Switcher */}
          <div className="flex items-center bg-gray-900/80 border border-white/10 rounded-xl p-0.5">
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as AggregationPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                  period === p ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Series Toggles */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Series:</span>
        
        <button
          onClick={() => setActiveSeries({ ...activeSeries, revenue: !activeSeries.revenue })}
          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeSeries.revenue
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-gray-900/40 text-gray-500 border-white/10 opacity-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Revenue</span>
        </button>

        {mapping.expenseField && (
          <button
            onClick={() => setActiveSeries({ ...activeSeries, expenses: !activeSeries.expenses })}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSeries.expenses
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-gray-900/40 text-gray-500 border-white/10 opacity-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Expenses</span>
          </button>
        )}

        {(mapping.profitField || mapping.expenseField) && (
          <button
            onClick={() => setActiveSeries({ ...activeSeries, profit: !activeSeries.profit })}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSeries.profit
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-gray-900/40 text-gray-500 border-white/10 opacity-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Profit</span>
          </button>
        )}
      </div>

      {/* Main Responsive Recharts Container */}
      <div className="h-72 lg:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={showForecast ? generatePredictiveForecast(data as any, 3) : data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0] && onChartClick) {
                  onChartClick(e.activePayload[0].payload);
                }
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="dateLabel"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {activeSeries.revenue && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              )}
              {activeSeries.expenses && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              )}
              {activeSeries.profit && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0] && onChartClick) {
                  onChartClick(e.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dateLabel" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(val) => formatCompactNumber(val)} />
              <Tooltip content={<CustomTooltip />} />
              {activeSeries.revenue && <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />}
              {activeSeries.expenses && <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />}
              {activeSeries.profit && <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
