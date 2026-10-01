import React from 'react';
import type { FieldMapping } from '../types/dashboard';
import { formatCurrency } from '../utils/dataProcessor';
import { DollarSign } from 'lucide-react';

interface FinancialSummaryCardProps {
  data: Record<string, any>[];
  mapping: FieldMapping;
  currencySymbol?: string;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  data,
  mapping,
  currencySymbol = '$'
}) => {
  if (!mapping.revenueField) return null;

  const totalRevenue = data.reduce((sum, r) => sum + (parseFloat(String(r[mapping.revenueField!]).replace(/[\$,%]/g, '')) || 0), 0);
  const totalExpenses = mapping.expenseField ? data.reduce((sum, r) => sum + (parseFloat(String(r[mapping.expenseField!]).replace(/[\$,%]/g, '')) || 0), 0) : totalRevenue * 0.55;
  const netProfit = mapping.profitField ? data.reduce((sum, r) => sum + (parseFloat(String(r[mapping.profitField!]).replace(/[\$,%]/g, '')) || 0), 0) : totalRevenue - totalExpenses;
  
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Executive Financial Summary</h3>
            <p className="text-xs text-gray-400">Profitability & Expense ratio breakdown</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
          Margin: {profitMargin.toFixed(1)}%
        </span>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-gray-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Revenue</span>
          <span className="text-xl font-bold text-cyan-400">{formatCurrency(totalRevenue, currencySymbol)}</span>
          <span className="text-[10px] text-gray-500 block">Gross Inflow</span>
        </div>

        {/* Operating Expenses */}
        <div className="p-4 rounded-2xl bg-gray-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Operating Costs</span>
          <span className="text-xl font-bold text-rose-400">{formatCurrency(totalExpenses, currencySymbol)}</span>
          <span className="text-[10px] text-gray-500 block">{expenseRatio.toFixed(1)}% of Revenue</span>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-2xl bg-gray-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Net Profit</span>
          <span className="text-xl font-bold text-emerald-400">{formatCurrency(netProfit, currencySymbol)}</span>
          <span className="text-[10px] text-emerald-500/80 font-semibold block">Net Retained Earnings</span>
        </div>

      </div>

      {/* Visual Profit Margin Progress Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-gray-300">Overall Profit Margin Efficiency</span>
          <span className="text-emerald-400 font-mono">{profitMargin.toFixed(1)}%</span>
        </div>

        <div className="w-full h-3 rounded-full bg-gray-900 border border-white/10 overflow-hidden relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-300 transition-all duration-500 shadow-lg shadow-emerald-500/30"
            style={{ width: `${Math.min(100, Math.max(0, profitMargin))}%` }}
          ></div>
        </div>
      </div>

    </div>
  );
};
