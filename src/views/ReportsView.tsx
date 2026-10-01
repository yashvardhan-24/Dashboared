import React from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import type {
  RawDataset,
  CompanyBranding,
  CalculatedKPI,
  AggregationTimeSeriesPoint
} from '../types/dashboard';
import { exportToCSV, exportToExcel, triggerPrintReport } from '../utils/exportUtils';
import { formatCurrency, formatCompactNumber } from '../utils/dataProcessor';

interface ReportsViewProps {
  dataset: RawDataset;
  branding: CompanyBranding;
  kpis: CalculatedKPI[];
  timeSeriesData: AggregationTimeSeriesPoint[];
  filteredData: Record<string, any>[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  dataset,
  branding,
  kpis,
  timeSeriesData,
  filteredData
}) => {
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Export Toolbar */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Executive Performance Report</h2>
            <p className="text-xs text-gray-400">Formal business briefing generated from active dataset records</p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportToCSV(filteredData, `${branding.companyName.toLowerCase().replace(/\s+/g, '_')}_report.csv`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900/80 border border-white/10 hover:border-white/20 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => exportToExcel(filteredData, `${branding.companyName.toLowerCase().replace(/\s+/g, '_')}_report.xlsx`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900/80 border border-white/10 hover:border-white/20 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={triggerPrintReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Formal Document Container */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
        
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
              CONFIDENTIAL BUSINESS INTELLIGENCE BRIEFING
            </span>
            <h1 className="text-2xl font-black text-white mt-1">{branding.companyName}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{branding.dashboardTitle} — {branding.industry}</p>
          </div>
          <div className="text-right text-xs text-gray-400 space-y-1">
            <p><span className="text-gray-500">Generated:</span> <span className="font-mono text-white">{currentDateStr}</span></p>
            <p><span className="text-gray-500">Source Dataset:</span> <span className="font-mono text-cyan-300">{dataset.name}</span></p>
            <p><span className="text-gray-500">Sample Records:</span> <span className="font-mono text-emerald-400">{filteredData.length.toLocaleString()}</span></p>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-4 rounded-2xl bg-gray-900/60 border border-white/10 text-xs text-gray-300 leading-relaxed space-y-2">
          <h4 className="font-bold text-white text-sm">Executive Overview</h4>
          <p>
            This automated performance evaluation reflects operations recorded across {filteredData.length.toLocaleString()} individual entries. Total generated volume across all matching channels has been compiled and normalized in accordance with the assigned dataset schema.
          </p>
        </div>

        {/* Key Metrics Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">Primary Performance Indicators</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <div key={kpi.id} className="p-4 rounded-2xl bg-gray-900/60 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">{kpi.label}</span>
                <span className="text-xl font-extrabold text-white font-sans block">
                  {kpi.format === 'currency'
                    ? formatCurrency(kpi.currentValue, branding.currency)
                    : kpi.format === 'percentage'
                    ? `${kpi.currentValue.toFixed(1)}%`
                    : formatCompactNumber(kpi.currentValue)}
                </span>
                <span className={`text-[10px] font-bold ${ (kpi.growthPercentage ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400' }`}>
                  {(kpi.growthPercentage ?? 0) >= 0 ? '+' : ''}{(kpi.growthPercentage ?? 0).toFixed(1)}% vs baseline
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Longitudinal Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-white text-sm">Temporal Performance Ledger</h4>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/80 text-gray-400 font-semibold border-b border-white/10 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">Reporting Period</th>
                  <th className="px-4 py-3">Revenue Inflow</th>
                  <th className="px-4 py-3">Operating Expense</th>
                  <th className="px-4 py-3">Net Profit</th>
                  <th className="px-4 py-3">Orders / Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px] text-gray-200">
                {timeSeriesData.map(pt => (
                  <tr key={pt.dateLabel} className="hover:bg-white/5">
                    <td className="px-4 py-2.5 font-bold text-white">{pt.dateLabel}</td>
                    <td className="px-4 py-2.5 text-cyan-400">{formatCurrency(pt.revenue, branding.currency)}</td>
                    <td className="px-4 py-2.5 text-rose-400">{formatCurrency(pt.expenses, branding.currency)}</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-bold">{formatCurrency(pt.profit, branding.currency)}</td>
                    <td className="px-4 py-2.5 text-gray-300">{pt.orders.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
