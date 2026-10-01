import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type {
  AggregationTimeSeriesPoint,
  CategoricalAggregation
} from '../types/dashboard';
import { formatCompactNumber, formatCurrency } from '../utils/dataProcessor';
import { BarChart3 } from 'lucide-react';

interface AnalyticsViewProps {
  timeSeriesData: AggregationTimeSeriesPoint[];
  regionalData: CategoricalAggregation[];
  productData: CategoricalAggregation[];
  currencySymbol?: string;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  timeSeriesData,
  regionalData,
  productData,
  currencySymbol = '$'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit' | 'orders'>('revenue');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-2xl border border-white/20 shadow-2xl text-xs space-y-1">
          <p className="font-bold text-white border-b border-white/10 pb-1">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 text-gray-300">
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-cyan-400 font-mono">
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
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Deep-Dive Analytics Studio</h2>
            <p className="text-xs text-gray-400">Multi-dimensional analysis across temporal, categorical, and performance vectors</p>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center bg-gray-900/80 border border-white/10 rounded-xl p-1">
          {[
            { id: 'revenue', label: 'Revenue' },
            { id: 'profit', label: 'Profit' },
            { id: 'orders', label: 'Orders' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMetric(m.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedMetric === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analytics Trend Chart */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-base">Longitudinal Trend Correlation</h3>
            <p className="text-xs text-gray-400">Analyzing {selectedMetric} velocity across all recorded periods</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
            {timeSeriesData.length} Periods Analyzed
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dateLabel" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#analyticsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Column Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regional Breakdown Table & Visual */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">
            Geographic Density Distribution
          </h3>

          <div className="space-y-3">
            {regionalData.map((reg, idx) => (
              <div key={reg.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-200">{reg.name}</span>
                  <span className="font-mono text-cyan-400 font-bold">{reg.formattedValue} ({reg.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, reg.percentage)}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Concentration */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">
            Product Concentration Matrix
          </h3>

          <div className="space-y-3">
            {productData.slice(0, 6).map((prod, idx) => (
              <div key={prod.name} className="flex items-center justify-between p-3 rounded-2xl bg-gray-900/60 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{prod.name}</h4>
                    <p className="text-[10px] text-gray-500">{prod.count} transactions</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-white block">{prod.formattedValue}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{prod.percentage}% of total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
