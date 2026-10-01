import React from 'react';
import {
  Settings,
  Database,
  Clock,
  Upload,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import type { FieldMapping, RawDataset } from '../types/dashboard';

interface SettingsViewProps {
  mapping: FieldMapping;
  dataset: RawDataset;
  autoRefreshInterval: number;
  onChangeAutoRefresh: (val: number) => void;
  onOpenUploader: () => void;
  onResetDataset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  mapping,
  dataset,
  autoRefreshInterval,
  onChangeAutoRefresh,
  onOpenUploader,
  onResetDataset
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Settings & Data Management</h2>
            <p className="text-xs text-gray-400">Configure dashboard identity, refresh timers, and manage ingested data</p>
          </div>
        </div>

        <button
          onClick={onOpenUploader}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Different Dataset</span>
        </button>
      </div>

      {/* Dataset Information Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Active Ingested Dataset</h3>
          </div>
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
            {dataset.data.length.toLocaleString()} Records Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-gray-900/60 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Dataset Title</span>
            <span className="text-white font-semibold">{dataset.name}</span>
          </div>
          <div className="p-3 rounded-2xl bg-gray-900/60 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Columns Analyzed</span>
            <span className="text-cyan-300 font-mono">{dataset.columns.length} columns identified</span>
          </div>
        </div>

        {/* Action: Disconnect & Return to Import Screen */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onResetDataset}
            className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 px-4 py-2 rounded-xl bg-red-950/30 border border-red-500/20 hover:bg-red-950/50 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Disconnect Dataset & Return to Import Screen</span>
          </button>
        </div>
      </div>

      {/* Live Polling Settings Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-base">Live Data Polling Interval</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'OFF', val: 0 },
            { label: '10 Seconds', val: 10 },
            { label: '30 Seconds', val: 30 },
            { label: '1 Minute', val: 60 },
            { label: '5 Minutes', val: 300 }
          ].map(item => (
            <button
              key={item.val}
              onClick={() => onChangeAutoRefresh(item.val)}
              className={`p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                autoRefreshInterval === item.val
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-gray-900/60 text-gray-400 hover:text-white border-white/10'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Assigned Schema Roles Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-base">Current Field Role Assignments</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {Object.entries(mapping).map(([role, col]) => (
            <div key={role} className="p-3 rounded-2xl bg-gray-900/60 border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-semibold block">{role}</span>
              <span className="text-cyan-400 font-mono font-bold truncate block">{col || 'Unassigned'}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
