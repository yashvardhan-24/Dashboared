import React from 'react';
import { DollarSign } from 'lucide-react';
import type { FieldMapping, AggregationTimeSeriesPoint } from '../types/dashboard';
import { formatCurrency, formatCompactNumber } from '../utils/dataProcessor';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface FinanceViewProps {
  filteredData: Record<string, any>[];
  mapping: FieldMapping;
  currencySymbol?: string;
  timeSeriesData: AggregationTimeSeriesPoint[];
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  filteredData,
  mapping,
  currencySymbol = '$',
  timeSeriesData
}) => {
  const totalRevenue = mapping.revenueField
    ? filteredData.reduce((acc, r) => acc + (parseFloat(String(r[mapping.revenueField!]).replace(/[\$,%]/g, '')) || 0), 0)
    : 0;

  const totalExpenses = mapping.expenseField
    ? filteredData.reduce((acc, r) => acc + (parseFloat(String(r[mapping.expenseField!]).replace(/[\$,%]/g, '')) || 0), 0)
    : totalRevenue * 0.55;

  const netProfit = mapping.profitField
    ? filteredData.reduce((acc, r) => acc + (parseFloat(String(r[mapping.profitField!]).replace(/[\$,%]/g, '')) || 0), 0)
    : totalRevenue - totalExpenses;

  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Financial Statement & Profitability</h2>
          <p className="text-xs text-gray-400">P&L summary, operational spend, and net margin efficiency</p>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Gross Operating Revenue</span>
          <span className="text-2xl font-extrabold text-cyan-400 block">{formatCurrency(totalRevenue, currencySymbol)}</span>
          <span className="text-[11px] text-gray-500 font-mono">100% Inflow</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Operational Overhead</span>
          <span className="text-2xl font-extrabold text-rose-400 block">{formatCurrency(totalExpenses, currencySymbol)}</span>
          <span className="text-[11px] text-rose-400/80 font-mono">{expenseRatio.toFixed(1)}% of Revenue</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Net Retained Profit</span>
          <span className="text-2xl font-extrabold text-emerald-400 block">{formatCurrency(netProfit, currencySymbol)}</span>
          <span className="text-[11px] text-emerald-400/80 font-mono">Bottom line yield</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Profit Margin Ratio</span>
          <span className="text-2xl font-extrabold text-purple-400 block">{profitMargin.toFixed(1)}%</span>
          <span className="text-[11px] text-gray-500 font-mono">Margin efficiency</span>
        </div>
      </div>

      {/* Net Profit Timeline Chart */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">
          Profit vs Expense Trajectory
        </h3>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dateLabel" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
              <Tooltip />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#profitGrad)" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
