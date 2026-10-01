import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import type { CategoricalAggregation } from '../types/dashboard';
import { formatCurrency } from '../utils/dataProcessor';

interface ProductsViewProps {
  productData: CategoricalAggregation[];
  currencySymbol?: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  productData,
  currencySymbol = '$'
}) => {
  const [prodSearch, setProdSearch] = useState('');

  const filteredProds = productData.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const totalProductsValue = productData.reduce((acc, p) => acc + p.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Product & SKU Performance Matrix</h2>
            <p className="text-xs text-gray-400">Inventory throughput, unit margins, and portfolio contribution</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={prodSearch}
            onChange={(e) => setProdSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid of Product Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Monitored Items</span>
          <span className="text-2xl font-extrabold text-white block">{productData.length}</span>
          <span className="text-[11px] text-gray-500 font-mono">Catalog items identified</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Top Performing SKU</span>
          <span className="text-lg font-bold text-cyan-400 truncate block">
            {productData[0]?.name || 'N/A'}
          </span>
          <span className="text-[11px] text-emerald-400 font-mono font-bold">
            {productData[0]?.percentage || 0}% of catalog sales
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cumulative Catalog Value</span>
          <span className="text-2xl font-extrabold text-emerald-400 block">{formatCurrency(totalProductsValue, currencySymbol)}</span>
          <span className="text-[11px] text-gray-500 font-mono">Aggregate volume</span>
        </div>
      </div>

      {/* Product Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">Complete Product Ledger</h3>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 text-gray-400 font-semibold uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Product Title / SKU</th>
                <th className="px-4 py-3">Units Processed</th>
                <th className="px-4 py-3">Gross Revenue</th>
                <th className="px-4 py-3">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px] text-gray-200">
              {filteredProds.map((p, idx) => (
                <tr key={p.name} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-bold text-cyan-400">#{idx + 1}</td>
                  <td className="px-4 py-2.5 font-sans font-semibold text-white">{p.name}</td>
                  <td className="px-4 py-2.5 text-gray-300">{p.count}</td>
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
