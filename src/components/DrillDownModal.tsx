import React from 'react';
import { X, Layers } from 'lucide-react';
import type { FieldMapping } from '../types/dashboard';
import { formatCurrency } from '../utils/dataProcessor';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  filteredRecords: Record<string, any>[];
  mapping: FieldMapping;
  currencySymbol?: string;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  filteredRecords,
  mapping,
  currencySymbol = '$'
}) => {
  if (!isOpen) return null;

  const totalRev = mapping.revenueField ? filteredRecords.reduce((acc, r) => acc + (parseFloat(String(r[mapping.revenueField!]).replace(/[\$,%]/g, '')) || 0), 0) : 0;
  const totalProfit = mapping.profitField ? filteredRecords.reduce((acc, r) => acc + (parseFloat(String(r[mapping.profitField!]).replace(/[\$,%]/g, '')) || 0), 0) : 0;

  const displayCols = Object.keys(filteredRecords[0] || {}).slice(0, 7);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="text-xs text-gray-400">{subtitle || `Drill-down inspection of ${filteredRecords.length} matching items`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-gray-900/60 border border-white/10">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Transactions</span>
            <span className="text-base font-bold text-white">{filteredRecords.length.toLocaleString()}</span>
          </div>

          {mapping.revenueField && (
            <div className="p-3 rounded-2xl bg-gray-900/60 border border-white/10">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Subtotal Revenue</span>
              <span className="text-base font-bold text-cyan-400">{formatCurrency(totalRev, currencySymbol)}</span>
            </div>
          )}

          {mapping.profitField && (
            <div className="p-3 rounded-2xl bg-gray-900/60 border border-white/10">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Subtotal Profit</span>
              <span className="text-base font-bold text-emerald-400">{formatCurrency(totalProfit, currencySymbol)}</span>
            </div>
          )}
        </div>

        {/* Subset Rows Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 max-h-64">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-gray-950/90 text-gray-300 font-semibold border-b border-white/10">
              <tr>
                {displayCols.map(col => (
                  <th key={col} className="px-3 py-2 uppercase font-mono text-[10px] whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200 font-mono text-[11px]">
              {filteredRecords.slice(0, 50).map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  {displayCols.map(col => (
                    <td key={col} className="px-3 py-2 whitespace-nowrap">
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all"
          >
            Close Drilldown
          </button>
        </div>

      </div>
    </div>
  );
};
