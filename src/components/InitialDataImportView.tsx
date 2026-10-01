import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  Sparkles,
  Settings2,
  ShieldCheck
} from 'lucide-react';
import type { RawDataset, FieldMapping, DetectedColumn } from '../types/dashboard';
import { detectSchema } from '../utils/schemaDetector';
import { SAMPLE_DATASETS } from '../utils/sampleDatasets';

interface InitialDataImportViewProps {
  onDatasetLoaded: (dataset: RawDataset) => void;
}

export const InitialDataImportView: React.FC<InitialDataImportViewProps> = ({ onDatasetLoaded }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'api' | 'sample'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Staged dataset state for review & mapping
  const [stagedDataset, setStagedDataset] = useState<{
    name: string;
    rows: Record<string, any>[];
    columns: DetectedColumn[];
    mapping: FieldMapping;
    quality: any;
  } | null>(null);

  // API State
  const [apiUrl, setApiUrl] = useState('');
  const [rawJsonInput, setRawJsonInput] = useState('');

  const handleRawDataParsed = (datasetName: string, rawRows: Record<string, any>[]) => {
    if (!rawRows || rawRows.length === 0) {
      setErrorMsg('No valid data rows found in dataset.');
      setIsProcessing(false);
      return;
    }

    try {
      const { columns, suggestedMapping, quality } = detectSchema(rawRows);
      setStagedDataset({
        name: datasetName,
        rows: rawRows,
        columns,
        mapping: suggestedMapping,
        quality
      });
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(`Schema detection error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          handleRawDataParsed(fileName, results.data as Record<string, any>[]);
        },
        error: (err) => {
          setErrorMsg(`CSV Parsing Failed: ${err.message}`);
          setIsProcessing(false);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          handleRawDataParsed(fileName, json as Record<string, any>[]);
        } catch (err: any) {
          setErrorMsg(`Excel Reading Failed: ${err.message}`);
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExt === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          const rows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || [parsed]);
          handleRawDataParsed(fileName, rows);
        } catch (err: any) {
          setErrorMsg(`JSON Parsing Failed: ${err.message}`);
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } else {
      setErrorMsg('Unsupported file format. Please provide CSV, XLSX, or JSON.');
      setIsProcessing(false);
    }
  };

  const handleFetchApi = async () => {
    if (!apiUrl.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || json.items || [json]);
      handleRawDataParsed(`API: ${new URL(apiUrl).hostname}`, rows);
    } catch (err: any) {
      setErrorMsg(`API Fetch Error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleParseRawJson = () => {
    if (!rawJsonInput.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(rawJsonInput);
      const rows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || [parsed]);
      handleRawDataParsed('Direct JSON Input', rows);
    } catch (err: any) {
      setErrorMsg(`Invalid JSON string: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleConfirmDataset = () => {
    if (!stagedDataset) return;
    onDatasetLoaded({
      name: stagedDataset.name,
      data: stagedDataset.rows,
      columns: stagedDataset.columns,
      mapping: stagedDataset.mapping,
      quality: stagedDataset.quality
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl space-y-6">
        
        {/* Top Welcome Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Analytics Engine</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
            Import Your Business Data
          </h1>
          <p className="text-sm lg:text-base text-gray-400 max-w-xl mx-auto">
            Upload your dataset in CSV, Excel, JSON or connect an API. The platform will automatically inspect columns, detect data types, calculate KPIs, and generate a dynamic dashboard.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STAGE 1: Data Input Selector */}
        {!stagedDataset ? (
          <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl space-y-6">
            
            {/* Tabs */}
            <div className="flex items-center justify-center gap-3 border-b border-white/10 pb-4">
              {[
                { id: 'upload', label: 'Upload File (CSV / XLSX / JSON)', icon: Upload },
                { id: 'api', label: 'API Endpoint / Raw JSON', icon: Globe },
                { id: 'sample', label: 'Explore Sample Datasets', icon: Database }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setErrorMsg(null); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Upload File Tab */}
            {activeTab === 'upload' && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('initial-file-import-input')?.click();
                }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all flex flex-col items-center justify-center gap-4 cursor-pointer ${
                  dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/15 bg-gray-900/40 hover:border-white/30'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
                  <Upload className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Drag & drop your business dataset here or Click to Browse</h3>
                  <p className="text-xs text-gray-400 mt-1">Accepts CSV, Excel (.xlsx, .xls), or JSON files</p>
                </div>

                <div className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20">
                  <span>{isProcessing ? 'Inspecting Data...' : 'Browse & Select File'}</span>
                </div>
                <input
                  id="initial-file-import-input"
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  className="hidden"
                  disabled={isProcessing}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">REST API URL Endpoint</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.example.com/v1/orders"
                      className="flex-1 bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleFetchApi}
                      disabled={isProcessing || !apiUrl.trim()}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? 'Fetching...' : 'Fetch & Inspect'}
                    </button>
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-[10px] uppercase font-semibold text-gray-500">Or Paste Raw JSON Array</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div>
                  <textarea
                    rows={6}
                    value={rawJsonInput}
                    onChange={(e) => setRawJsonInput(e.target.value)}
                    placeholder='[{"order_id": "ORD-101", "date": "2026-03-01", "revenue": 1200, "region": "North America", "profit": 450}]'
                    className="w-full bg-gray-900/80 border border-white/10 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleParseRawJson}
                    disabled={isProcessing || !rawJsonInput.trim()}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Parse JSON Dataset
                  </button>
                </div>
              </div>
            )}

            {/* Sample Datasets Tab */}
            {activeTab === 'sample' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center mb-2">
                  Don't have a dataset ready? Choose a simulated industry dataset to experience automatic generation:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'ecommerce', title: 'Global E-Commerce Sales', desc: 'Orders, Revenue, Margins, Products & Geography', icon: FileSpreadsheet, color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30' },
                    { key: 'saas', title: 'SaaS ARR & Financials', desc: 'MRR, Operating Spend, Subscribers & Retention', icon: FileCode, color: 'from-purple-500/20 to-pink-600/20 border-purple-500/30' },
                    { key: 'healthcare', title: 'Healthcare Operations', desc: 'Patient Admissions, Billing & Department Margins', icon: Globe, color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' }
                  ].map(sample => {
                    const Icon = sample.icon;
                    return (
                      <div
                        key={sample.key}
                        onClick={() => {
                          setIsProcessing(true);
                          setTimeout(() => {
                            const ds = SAMPLE_DATASETS[sample.key]();
                            setStagedDataset({
                              name: ds.name,
                              rows: ds.data,
                              columns: ds.columns,
                              mapping: ds.mapping,
                              quality: ds.quality
                            });
                            setIsProcessing(false);
                          }, 150);
                        }}
                        className={`p-5 rounded-2xl bg-gradient-to-br ${sample.color} border hover:border-white/40 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-5 h-5 text-white" />
                          <h4 className="font-bold text-white text-sm">{sample.title}</h4>
                        </div>
                        <p className="text-xs text-gray-300">{sample.desc}</p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                          <span>Inspect Sample</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* STAGE 2: Data Quality & Schema Mapping Review */
          <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl space-y-6 animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Dataset Schema & Quality Audit</span>
                </h3>
                <p className="text-xs text-gray-400">Dataset: {stagedDataset.name}</p>
              </div>

              <button
                onClick={() => setStagedDataset(null)}
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5"
              >
                Choose Another File
              </button>
            </div>

            {/* Quality Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-900/60 border border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Records</span>
                <span className="text-xl font-extrabold text-cyan-400">{stagedDataset.quality.totalRows.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Detected Columns</span>
                <span className="text-xl font-extrabold text-white">{stagedDataset.columns.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Data Health</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {Math.round((stagedDataset.quality.validRows / Math.max(1, stagedDataset.quality.totalRows)) * 100)}% Valid
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date Span</span>
                <span className="text-xs font-mono text-purple-300 block truncate font-bold">
                  {stagedDataset.quality.dateRangeStart || 'N/A'} → {stagedDataset.quality.dateRangeEnd || 'N/A'}
                </span>
              </div>
            </div>

            {/* Field Role Mapping Overrides */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-cyan-400" />
                  <span>Detected Role Assignments</span>
                </h4>
                <span className="text-[11px] text-gray-400">Review or adjust column mappings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                {[
                  { role: 'dateField', label: 'Date Field', type: 'date' },
                  { role: 'revenueField', label: 'Revenue / Amount', type: 'currency/number' },
                  { role: 'profitField', label: 'Profit / Margin', type: 'currency/number' },
                  { role: 'expenseField', label: 'Expenses / Costs', type: 'currency/number' },
                  { role: 'ordersField', label: 'Orders / Quantity', type: 'number' },
                  { role: 'customerField', label: 'Customer / User', type: 'category/text' },
                  { role: 'productField', label: 'Product / Item', type: 'category/text' },
                  { role: 'regionField', label: 'Region / Geography', type: 'category/text' },
                  { role: 'categoryField', label: 'Category / Department', type: 'category' }
                ].map(item => (
                  <div key={item.role} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/80 border border-white/10">
                    <div>
                      <span className="text-xs font-semibold text-white block">{item.label}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{item.type}</span>
                    </div>
                    <select
                      value={(stagedDataset.mapping as any)[item.role] || ''}
                      onChange={(e) => {
                        setStagedDataset({
                          ...stagedDataset,
                          mapping: {
                            ...stagedDataset.mapping,
                            [item.role]: e.target.value || undefined
                          }
                        });
                      }}
                      className="bg-gray-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- None / Auto --</option>
                      {stagedDataset.columns.map(c => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Generation Confirmation */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStagedDataset(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDataset}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold transition-all shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Launch Business Analytics Dashboard</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
