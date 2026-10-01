import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  RefreshCw,
  Upload,
  SlidersHorizontal,
  Download,
  Building2,
  ChevronDown,
  Check,
  Clock,
  Sparkles,
  Bell
} from 'lucide-react';
import type { CompanyBranding, DateFilterState, DatePreset, CalculatedKPI, DetectedColumn } from '../types/dashboard';
import { exportToCSV, exportToExcel, exportToJSON, triggerPrintReport } from '../utils/exportUtils';
import { SearchResultsPanel } from './SearchResultsPanel';

interface HeaderProps {
  branding: CompanyBranding;
  dateFilter: DateFilterState;
  onDateFilterChange: (newFilter: DateFilterState) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lastUpdated: Date;
  autoRefreshInterval: number; // in seconds, 0 = OFF
  onChangeAutoRefresh: (interval: number) => void;
  onManualRefresh: () => void;
  onOpenUploader: () => void;
  onOpenBranding: () => void;
  onOpenCustomizer: () => void;
  datasetData: Record<string, any>[];
  datasetName: string;
  // Smart search extras
  kpis: CalculatedKPI[];
  columns: DetectedColumn[];
  currencySymbol?: string;
  activeRole: 'Admin' | 'Manager' | 'Viewer';
  onRoleChange: (role: 'Admin' | 'Manager' | 'Viewer') => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  branding,
  dateFilter,
  onDateFilterChange,
  searchQuery,
  onSearchChange,
  lastUpdated,
  autoRefreshInterval,
  onChangeAutoRefresh,
  onManualRefresh,
  onOpenUploader,
  onOpenBranding,
  onOpenCustomizer,
  datasetData,
  datasetName,
  kpis,
  columns,
  currencySymbol = '$',
  activeRole,
  onRoleChange,
  unreadNotificationsCount = 0,
  onOpenNotifications
}) => {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showRefreshDropdown, setShowRefreshDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchPanel(false);
        onSearchChange('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onSearchChange]);

  // Dynamic seconds counter for last updated
  React.useEffect(() => {
    const updateDiff = () => {
      const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setSecondsSinceUpdate(Math.max(0, diff));
    };
    updateDiff();
    const timer = setInterval(updateDiff, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const presets: { key: DatePreset; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7days', label: 'Last 7 Days' },
    { key: 'last30days', label: 'Last 30 Days' },
    { key: 'last90days', label: 'Last 90 Days' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'thisQuarter', label: 'This Quarter' },
    { key: 'thisYear', label: 'This Year' },
    { key: 'ytd', label: 'Year To Date' },
    { key: 'custom', label: 'Custom Date Range' }
  ];

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onManualRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const activePresetLabel = presets.find(p => p.key === dateFilter.preset)?.label || 'Date Range';

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBranding}
              title="Click to customize company branding"
              className="relative group flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 overflow-hidden"
            >
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.companyName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-cyan-400 text-sm tracking-wider">{branding.initials}</span>
              )}
              <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Building2 className="w-4 h-4 text-cyan-200" />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white tracking-tight text-lg group cursor-pointer" onClick={onOpenBranding}>
                  {branding.companyName}
                </h1>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {branding.industry || 'Analytics'}
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span>{branding.dashboardTitle}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 font-mono text-[11px] truncate max-w-[180px]">{datasetName}</span>
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenUploader}
              className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" /> Data
            </button>
          </div>
        </div>

        {/* Center: Search & Global Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl justify-center">
          {/* Search Bar + Smart Results Panel */}
          <div className="relative flex-1 max-w-md" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSearchPanel(!!e.target.value.trim());
              }}
              onFocus={() => { if (searchQuery.trim()) setShowSearchPanel(true); }}
              placeholder="Search metrics, revenue, customers, products..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-900/60 border text-gray-200 placeholder-gray-500 focus:outline-none transition-all ${
                searchQuery
                  ? 'border-cyan-500/50 ring-1 ring-cyan-500/30'
                  : 'border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => { onSearchChange(''); setShowSearchPanel(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Smart Search Results Dropdown */}
            {showSearchPanel && searchQuery.trim() && (
              <SearchResultsPanel
                query={searchQuery}
                kpis={kpis}
                columns={columns}
                filteredData={datasetData}
                currencySymbol={currencySymbol}
                onClose={() => { setShowSearchPanel(false); onSearchChange(''); }}
              />
            )}
          </div>

          {/* Date Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl bg-gray-900/60 border border-white/10 hover:border-white/20 text-gray-200 transition-all font-medium"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activePresetLabel}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-3 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider mb-2 px-2">Select Range</div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {presets.map(p => (
                    <button
                      key={p.key}
                      onClick={() => {
                        onDateFilterChange({ ...dateFilter, preset: p.key });
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                        dateFilter.preset === p.key ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{p.label}</span>
                      {dateFilter.preset === p.key && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>

                {/* Manual Year & Custom Inputs */}
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Manual Date Picker</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Start Date</label>
                      <input
                        type="date"
                        value={dateFilter.startDate || ''}
                        onChange={(e) => onDateFilterChange({ ...dateFilter, preset: 'custom', startDate: e.target.value })}
                        className="w-full bg-gray-900/80 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">End Date</label>
                      <input
                        type="date"
                        value={dateFilter.endDate || ''}
                        onChange={(e) => onDateFilterChange({ ...dateFilter, preset: 'custom', endDate: e.target.value })}
                        className="w-full bg-gray-900/80 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls, Live Data Indicator, Upload & Export */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Live Indicator with dynamic last updated time */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE</span>
            <span className="text-[10px] text-gray-400 font-normal border-l border-white/10 pl-2">
              {secondsSinceUpdate < 3 ? 'Updated: Just now' : `Updated: ${secondsSinceUpdate}s ago`}
            </span>
          </div>

          {/* Refresh & Auto Refresh Selector */}
          <div className="relative">
            <div className="flex items-center bg-gray-900/60 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={handleRefreshClick}
                className="px-2.5 py-2 text-gray-300 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer"
                title="Fetch / Ingest Live Data Now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <button
                onClick={() => setShowRefreshDropdown(!showRefreshDropdown)}
                className="px-2 py-2 border-l border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all text-xs"
                title="Auto Refresh Settings"
              >
                <Clock className="w-3 h-3" />
              </button>
            </div>

            {showRefreshDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl z-50">
                <div className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider mb-1 px-2">Auto Refresh Interval</div>
                {[
                  { label: 'OFF', val: 0 },
                  { label: 'Every 10 seconds', val: 10 },
                  { label: 'Every 30 seconds', val: 30 },
                  { label: 'Every 1 minute', val: 60 },
                  { label: 'Every 5 minutes', val: 300 }
                ].map(item => (
                  <button
                    key={item.val}
                    onClick={() => {
                      onChangeAutoRefresh(item.val);
                      setShowRefreshDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      autoRefreshInterval === item.val ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {autoRefreshInterval === item.val && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Import Data Button */}
          <button
            onClick={onOpenUploader}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 text-xs font-semibold transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import Data</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="p-2 rounded-xl bg-gray-900/60 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Export Dashboard & Data"
            >
              <Download className="w-4 h-4" />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl z-50">
                <div className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider mb-1 px-2">Export Data / Report</div>
                <button
                  onClick={() => { exportToCSV(datasetData, `${datasetName.toLowerCase().replace(/\s+/g, '_')}_data.csv`); setShowExportDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center justify-between"
                >
                  <span>Export to CSV</span>
                  <span className="text-[10px] font-mono text-gray-500">.csv</span>
                </button>
                <button
                  onClick={() => { exportToExcel(datasetData, `${datasetName.toLowerCase().replace(/\s+/g, '_')}_data.xlsx`); setShowExportDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center justify-between"
                >
                  <span>Export to Excel</span>
                  <span className="text-[10px] font-mono text-gray-500">.xlsx</span>
                </button>
                <button
                  onClick={() => { exportToJSON(datasetData, `${datasetName.toLowerCase().replace(/\s+/g, '_')}_data.json`); setShowExportDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center justify-between"
                >
                  <span>Export to JSON</span>
                  <span className="text-[10px] font-mono text-gray-500">.json</span>
                </button>
                <div className="my-1 border-t border-white/10"></div>
                <button
                  onClick={() => { triggerPrintReport(); setShowExportDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-cyan-400 hover:bg-cyan-500/10 font-semibold flex items-center justify-between"
                >
                  <span>Print PDF Report</span>
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </button>
              </div>
            )}
          </div>

          {/* Customizer Button */}
          <button
            onClick={onOpenCustomizer}
            className="p-2 rounded-xl bg-gray-900/60 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Customize Dashboard Cards"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-gray-900/60 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Notifications & System Telemetry"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile & Role Selector */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as any)}
              className="bg-slate-900 border border-purple-500/30 text-purple-300 font-semibold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="Admin">🛡️ Admin</option>
              <option value="Manager">💼 Manager</option>
              <option value="Viewer">👁️ Viewer</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
