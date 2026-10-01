import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { CalculatedKPI } from '../types/dashboard';
import { formatCompactNumber, formatCurrency, formatPercentage } from '../utils/dataProcessor';

interface KpiCardProps {
  kpi: CalculatedKPI;
  currencySymbol?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ kpi, currencySymbol = '$' }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return DollarSign;
      case 'ShoppingBag': return ShoppingBag;
      case 'Users': return Users;
      case 'CreditCard': return CreditCard;
      case 'PieChart': return PieChart;
      default: return Activity;
    }
  };

  const Icon = getIcon(kpi.icon);
  const isPositive = (kpi.growthPercentage ?? 0) >= 0;
  const growthFormatted = formatPercentage(kpi.growthPercentage ?? 0);

  let formattedValue = '';
  if (kpi.format === 'currency') {
    formattedValue = formatCurrency(kpi.currentValue, currencySymbol);
  } else if (kpi.format === 'percentage') {
    formattedValue = `${kpi.currentValue.toFixed(1)}%`;
  } else {
    formattedValue = formatCompactNumber(kpi.currentValue);
  }

  let formattedPrev = '';
  if (kpi.format === 'currency') {
    formattedPrev = formatCurrency(kpi.previousValue, currencySymbol);
  } else if (kpi.format === 'percentage') {
    formattedPrev = `${kpi.previousValue.toFixed(1)}%`;
  } else {
    formattedPrev = formatCompactNumber(kpi.previousValue);
  }

  return (
    <div className="glass-panel-interactive rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-opacity ${
        isPositive ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'
      }`}></div>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
          {kpi.label}
        </span>
        <div className="p-2 rounded-xl bg-gray-900/80 border border-white/10 text-cyan-400 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-all shadow-md">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="relative z-10 mb-3">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans group-hover:text-cyan-200 transition-colors">
          {formattedValue}
        </h3>
      </div>

      {/* Growth comparison vs previous period */}
      <div className="flex items-center justify-between text-xs relative z-10">
        <div className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg border ${
          isPositive
            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-950/50 text-rose-400 border-rose-500/30'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{growthFormatted}</span>
        </div>

        <span className="text-[11px] text-gray-400 font-medium">
          vs prev ({formattedPrev})
        </span>
      </div>
    </div>
  );
};
