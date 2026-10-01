import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import type { CategoricalAggregation } from '../types/dashboard';
import { formatCompactNumber } from '../utils/dataProcessor';
import { MapPin, Package, PieChart as PieIcon } from 'lucide-react';

interface CategoricalChartsProps {
  regionalData: CategoricalAggregation[];
  productData: CategoricalAggregation[];
  categoryData: CategoricalAggregation[];
  onItemClick?: (item: CategoricalAggregation, fieldType: string) => void;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

export const CategoricalCharts: React.FC<CategoricalChartsProps> = ({
  regionalData,
  productData,
  categoryData,
  onItemClick
}) => {
  const [topNProducts, setTopNProducts] = useState<number>(5);

  const displayedProducts = productData.slice(0, topNProducts);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: CategoricalAggregation = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-2xl border border-white/20 shadow-2xl space-y-1 text-xs font-sans min-w-[140px]">
          <p className="font-bold text-white border-b border-white/10 pb-1">{data.name}</p>
          <div className="flex items-center justify-between gap-3 text-gray-300">
            <span>Value:</span>
            <span className="font-bold text-cyan-400 font-mono">{data.formattedValue}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-gray-300">
            <span>Share:</span>
            <span className="font-bold text-purple-400 font-mono">{data.percentage}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-gray-300">
            <span>Count:</span>
            <span className="font-bold text-emerald-400 font-mono">{data.count.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* 1. SALES BY REGION / LOCATION BAR CHART */}
      {regionalData.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Regional Performance</h3>
                <p className="text-xs text-gray-400">Breakdown by geography & location</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {regionalData.length} Regions
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionalData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0] && onItemClick) {
                    onItemClick(e.activePayload[0].payload, 'region');
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} cursor="pointer">
                  {regionalData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. TOP PRODUCTS HORIZONTAL BAR CHART */}
      {productData.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Top Performing Products</h3>
                <p className="text-xs text-gray-400">Ranked by revenue contribution</p>
              </div>
            </div>

            {/* Top N Switcher */}
            <div className="flex items-center bg-gray-900/80 border border-white/10 rounded-xl p-0.5">
              {[5, 10, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setTopNProducts(n)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    topNProducts === n ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={displayedProducts}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0] && onItemClick) {
                    onItemClick(e.activePayload[0].payload, 'product');
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#6b7280" fontSize={11} tickFormatter={(v) => formatCompactNumber(v)} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={100} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} cursor="pointer">
                  {displayedProducts.map((_, index) => (
                    <Cell key={`prod-cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. CATEGORY / SEGMENT DONUT DISTRIBUTION CHART */}
      {categoryData.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Category & Segment Share</h3>
                <p className="text-xs text-gray-400">Distribution ratio across business verticals</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    cursor="pointer"
                    onClick={(entry: any) => {
                      if (onItemClick) onItemClick(entry, 'category');
                    }}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`donut-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {categoryData.map((cat, idx) => (
                <div
                  key={cat.name}
                  onClick={() => onItemClick && onItemClick(cat, 'category')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">{cat.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-white block">{cat.formattedValue}</span>
                    <span className="text-[10px] text-gray-400">{cat.percentage}% share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
