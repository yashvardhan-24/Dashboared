import React from 'react';
import { ShoppingBag } from 'lucide-react';
import type {
  FieldMapping,
  CategoricalAggregation
} from '../types/dashboard';
import { formatCurrency } from '../utils/dataProcessor';

interface SalesViewProps {
  filteredData: Record<string, any>[];
  mapping: FieldMapping;
  currencySymbol?: string;
  productData: CategoricalAggregation[];
}

export const SalesView: React.FC<SalesViewProps> = ({
  filteredData,
  mapping,
  currencySymbol = '$',
  productData
}) => {
  const totalRevenue = mapping.revenueField
    ? filteredData.reduce((acc, r) => acc + (parseFloat(String(r[mapping.revenueField!]).replace(/[\$,%]/g, '')) || 0), 0)
    : 0;

  const totalOrders = mapping.ordersField
    ? filteredData.reduce((acc, r) => acc + (parseFloat(String(r[mapping.ordersField!]).replace(/[\$,%]/g, '')) || 1), 0)
    : filteredData.length;

  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Status breakdown if status field exists
  const statusCounts: Record<string, number> = {};
  if (mapping.statusField) {
    filteredData.forEach(r => {
      const s = String(r[mapping.statusField!] || 'Unspecified');
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Sales & Commercial Operations</h2>
          <p className="text-xs text-gray-400">Order throughput, average ticket size, and territorial monetization</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Gross Sales Volume</span>
          <span className="text-2xl font-extrabold text-cyan-400 block">{formatCurrency(totalRevenue, currencySymbol)}</span>
          <span className="text-[11px] text-gray-500 font-mono">From {filteredData.length} records</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Orders Processed</span>
          <span className="text-2xl font-extrabold text-white block">{totalOrders.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-400 font-semibold font-mono">100% data accounted</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Average Order Value (AOV)</span>
          <span className="text-2xl font-extrabold text-purple-400 block">{formatCurrency(aov, currencySymbol)}</span>
          <span className="text-[11px] text-gray-500 font-mono">Revenue per transaction unit</span>
        </div>
      </div>

      {/* Status Breakdown if available */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">Fulfillment & Status Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(statusCounts).map(([st, cnt]) => (
              <div key={st} className="p-4 rounded-2xl bg-gray-900/60 border border-white/10 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">{st}</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{cnt.toLocaleString()}</span>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  {Math.round((cnt / filteredData.length) * 100)}% of volume
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">Product Sales Leaderboard</h3>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 text-gray-400 font-semibold uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Sales Volume</th>
                <th className="px-4 py-3">Revenue Contribution</th>
                <th className="px-4 py-3">Market Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px] text-gray-200">
              {productData.map((p, idx) => (
                <tr key={p.name} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-bold text-cyan-400">#{idx + 1}</td>
                  <td className="px-4 py-2.5 text-white font-sans font-semibold">{p.name}</td>
                  <td className="px-4 py-2.5 text-gray-300">{p.count} units</td>
                  <td className="px-4 py-2.5 text-emerald-400 font-bold">{p.formattedValue}</td>
                  <td className="px-4 py-2.5 text-purple-400 font-bold">{p.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
