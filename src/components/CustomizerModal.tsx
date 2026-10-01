import React from 'react';
import { X, SlidersHorizontal, Eye, EyeOff, Check } from 'lucide-react';
import type { VisibilityConfig } from '../types/dashboard';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: VisibilityConfig;
  onChangeVisibility: (newVis: VisibilityConfig) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  visibility,
  onChangeVisibility
}) => {
  if (!isOpen) return null;

  const sections: { key: keyof VisibilityConfig; label: string; desc: string }[] = [
    { key: 'kpis', label: 'KPI Metric Cards', desc: 'Total revenue, profit, orders, customer counts' },
    { key: 'revenueOverview', label: 'Financial Revenue Trend Chart', desc: 'Primary time-series area/bar chart' },
    { key: 'regionalCategory', label: 'Regional & Category Charts', desc: 'Location bar chart and Donut distribution' },
    { key: 'topProducts', label: 'Top Products Performance', desc: 'Horizontal ranking of top products' },
    { key: 'financialSummary', label: 'Executive Financial Summary', desc: 'Operating expenses and profit margin ring' },
    { key: 'activityFeed', label: 'Latest Transaction Feed', desc: 'Real-time event stream from actual data' },
    { key: 'dataTable', label: 'Filtered Raw Data Matrix', desc: 'Searchable paginated dataset table' },
    { key: 'dataQuality', label: 'Data Quality Audit Banner', desc: 'Record count, null values, and valid row %' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Dashboard Customizer</h3>
              <p className="text-xs text-gray-400">Toggle component visibility & layout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {sections.map(sec => {
            const isVisible = visibility[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => onChangeVisibility({ ...visibility, [sec.key]: !isVisible })}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isVisible ? 'bg-gray-900/80 border-cyan-500/40 text-white' : 'bg-gray-950/40 border-white/5 text-gray-500 opacity-60'
                }`}
              >
                <div>
                  <h4 className="text-xs font-semibold">{sec.label}</h4>
                  <p className="text-[10px] text-gray-400">{sec.desc}</p>
                </div>
                <div className={`p-1.5 rounded-xl ${isVisible ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Done
          </button>
        </div>

      </div>
    </div>
  );
};
