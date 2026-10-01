import React, { useState, useMemo } from 'react';
import { Users, Search } from 'lucide-react';
import type { FieldMapping } from '../types/dashboard';
import { formatCurrency } from '../utils/dataProcessor';

interface CustomersViewProps {
  filteredData: Record<string, any>[];
  mapping: FieldMapping;
  currencySymbol?: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  filteredData,
  mapping,
  currencySymbol = '$'
}) => {
  const [custSearch, setCustSearch] = useState('');

  const customerField = mapping.customerField || 'customer_name';

  // Aggregate stats per unique customer
  const customerList = useMemo(() => {
    const map: Record<string, { name: string; totalSpend: number; ordersCount: number; lastDate: string }> = {};

    filteredData.forEach(r => {
      const name = String(r[customerField] || 'Anonymous');
      const spend = mapping.revenueField ? parseFloat(String(r[mapping.revenueField]).replace(/[\$,%]/g, '')) || 0 : 0;
      const date = mapping.dateField ? String(r[mapping.dateField] || '') : '';

      if (!map[name]) {
        map[name] = { name, totalSpend: 0, ordersCount: 0, lastDate: date };
      }
      map[name].totalSpend += spend;
      map[name].ordersCount += 1;
      if (date && (!map[name].lastDate || date > map[name].lastDate)) {
        map[name].lastDate = date;
      }
    });

    return Object.values(map).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [filteredData, customerField, mapping]);

  const filteredCustomers = customerList.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Customer Intelligence & Accounts</h2>
            <p className="text-xs text-gray-400">Total client roster, cumulative spending, and purchase frequency</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={custSearch}
            onChange={(e) => setCustSearch(e.target.value)}
            placeholder="Filter customers..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Customer Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Identified Accounts</span>
          <span className="text-2xl font-extrabold text-cyan-400 block">{customerList.length.toLocaleString()}</span>
          <span className="text-[11px] text-gray-500 font-mono">Unique customer records</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Top Spender Account</span>
          <span className="text-lg font-bold text-emerald-400 truncate block">
            {customerList[0]?.name || 'N/A'}
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            {customerList[0] ? formatCurrency(customerList[0].totalSpend, currencySymbol) : '$0'} lifetime
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Avg Transactions / Client</span>
          <span className="text-2xl font-extrabold text-purple-400 block">
            {customerList.length > 0 ? (filteredData.length / customerList.length).toFixed(1) : 0}
          </span>
          <span className="text-[11px] text-gray-500 font-mono">Repeat order density</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white text-base">Client Accounts Directory</h3>
          <span className="text-xs text-gray-400 font-mono">Showing {filteredCustomers.length} accounts</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 text-gray-400 font-semibold uppercase font-mono text-[10px] sticky top-0">
              <tr>
                <th className="px-4 py-3">Customer / Organization</th>
                <th className="px-4 py-3">Cumulative Spend</th>
                <th className="px-4 py-3">Orders Completed</th>
                <th className="px-4 py-3">Average Ticket</th>
                <th className="px-4 py-3">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px] text-gray-200">
              {filteredCustomers.map((c) => (
                <tr key={c.name} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-2.5 font-sans font-semibold text-white">{c.name}</td>
                  <td className="px-4 py-2.5 text-cyan-400 font-bold">{formatCurrency(c.totalSpend, currencySymbol)}</td>
                  <td className="px-4 py-2.5 text-gray-300">{c.ordersCount}</td>
                  <td className="px-4 py-2.5 text-purple-400 font-bold">
                    {formatCurrency(c.ordersCount > 0 ? c.totalSpend / c.ordersCount : 0, currencySymbol)}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{c.lastDate || 'Recent'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
