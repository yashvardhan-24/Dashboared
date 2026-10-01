import React from 'react';
import type { DataQualityReport } from '../types/dashboard';
import { ShieldCheck } from 'lucide-react';

interface DataQualityCardProps {
  quality: DataQualityReport;
  columnCount: number;
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({ quality, columnCount }) => {
  const validPercentage = quality.totalRows > 0
    ? Math.round((quality.validRows / quality.totalRows) * 100)
    : 100;

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3 mb-6 bg-gradient-to-br from-gray-900/80 via-gray-900/40 to-cyan-950/20">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Automated Data Quality Audit</h3>
            <p className="text-[11px] text-gray-400">System validated schema integrity & health score</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 font-mono">
          Health Score: {validPercentage}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-gray-950/60 border border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Total Ingested Rows</span>
          <span className="text-sm font-bold text-white font-mono">{quality.totalRows.toLocaleString()}</span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-950/60 border border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Columns Analyzed</span>
          <span className="text-sm font-bold text-cyan-400 font-mono">{columnCount}</span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-950/60 border border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Missing / Nulls</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{quality.nullValuesCount.toLocaleString()}</span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-950/60 border border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Duplicates</span>
          <span className="text-sm font-bold text-rose-400 font-mono">{quality.duplicateRowsCount.toLocaleString()}</span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-950/60 border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-gray-500 uppercase font-semibold block">Date Span</span>
          <span className="text-[11px] font-bold text-purple-300 font-mono truncate block">
            {quality.dateRangeStart || 'N/A'} → {quality.dateRangeEnd || 'N/A'}
          </span>
        </div>
      </div>

    </div>
  );
};
