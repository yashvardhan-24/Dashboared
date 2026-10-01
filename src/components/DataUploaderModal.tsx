import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Globe,
  X,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  Sparkles,
  Settings2
} from 'lucide-react';
import type { RawDataset, FieldMapping, DetectedColumn } from '../types/dashboard';
import { detectSchema } from '../utils/schemaDetector';
import { SAMPLE_DATASETS } from '../utils/sampleDatasets';

interface DataUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: RawDataset) => void;
}

export const DataUploaderModal: React.FC<DataUploaderModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'api' | 'samples'>('file');
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

  if (!isOpen) return null;

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

  // Handle File Upload Parsing
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
      setErrorMsg('Unsupported file type. Please upload CSV, XLSX, or JSON.');
      setIsProcessing(false);
    }
  };

  // Handle API Fetching
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

  // Handle Raw JSON Paste
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

  // Confirm Final Dataset Generation
  const handleConfirmDataset = () => {
    if (!stagedDataset) return;
    onDatasetLoaded({
      name: stagedDataset.name,
      data: stagedDataset.rows,
      columns: stagedDataset.columns,
      mapping: stagedDataset.mapping,
      quality: stagedDataset.quality
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Data Import & Schema Hub</h3>
              <p className="text-xs text-gray-400">Upload business data in CSV, Excel, JSON or connect API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        {!stagedDataset && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            {[
              { id: 'file', label: 'File Upload (CSV / XLSX / JSON)', icon: Upload },
              { id: 'api', label: 'API / Raw JSON', icon: Globe },
              { id: 'samples', label: 'Quick Sample Datasets', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setErrorMsg(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STAGE 1: INGESTION INPUTS */}
        {!stagedDataset && (
          <div>
            {activeTab === 'file' && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('file-upload-modal-input')?.click();
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
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                  dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/15 bg-gray-900/40 hover:border-white/30'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Drag & Drop your dataset file here or Click to Browse</h4>
                  <p className="text-xs text-gray-400 mt-1">Supports .CSV, .XLSX, .XLS, and .JSON files</p>
                </div>
                <div className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-500/20">
                  <span>Browse File</span>
                </div>
                <input
                  id="file-upload-modal-input"
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  className="hidden"
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

            {activeTab === 'api' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Fetch REST API JSON Endpoint</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.example.com/v1/analytics/orders"
                      className="flex-1 bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleFetchApi}
                      disabled={isProcessing || !apiUrl.trim()}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition-all disabled:opacity-50"
                    >
                      Fetch Data
                    </button>
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-[10px] uppercase font-semibold text-gray-500">Or Paste JSON Data</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div>
                  <textarea
                    rows={5}
                    value={rawJsonInput}
                    onChange={(e) => setRawJsonInput(e.target.value)}
                    placeholder='[{"order_date": "2026-03-01", "revenue": 1450, "region": "North America"}]'
                    className="w-full bg-gray-900/80 border border-white/10 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleParseRawJson}
                    disabled={isProcessing || !rawJsonInput.trim()}
                    className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
                  >
                    Parse JSON Data
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'samples' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: 'ecommerce', title: 'Global E-Commerce Sales', desc: 'Orders, Revenue, Profit, Customer names, Product categories', icon: FileSpreadsheet, color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30' },
                  { key: 'saas', title: 'SaaS ARR & Financials', desc: 'Monthly recurring revenue, Subscribers, Expense, Profit margins', icon: FileCode, color: 'from-purple-500/20 to-pink-600/20 border-purple-500/30' },
                  { key: 'healthcare', title: 'Healthcare Operations', desc: 'Patient admissions, Department billing, Operational costs', icon: Globe, color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' }
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
                        }, 200);
                      }}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${sample.color} border hover:border-white/40 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-white" />
                        <h4 className="font-bold text-white text-xs">{sample.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-300">{sample.desc}</p>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300">
                        <span>Load Sample</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: DATA AUDIT & SCHEMA MAPPER */}
        {stagedDataset && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Quality Summary Banner */}
            <div className="p-4 rounded-2xl bg-gray-900/70 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Records</span>
                <span className="text-lg font-bold text-cyan-400">{stagedDataset.quality.totalRows.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Detected Columns</span>
                <span className="text-lg font-bold text-white">{stagedDataset.columns.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Data Quality</span>
                <span className="text-lg font-bold text-emerald-400">
                  {Math.round((stagedDataset.quality.validRows / Math.max(1, stagedDataset.quality.totalRows)) * 100)}% Valid
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date Span</span>
                <span className="text-xs font-mono text-gray-300 block truncate">
                  {stagedDataset.quality.dateRangeStart || 'N/A'} → {stagedDataset.quality.dateRangeEnd || 'N/A'}
                </span>
              </div>
            </div>

            {/* Field Mapping Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-cyan-400" />
                  <span>Field Role Assignments</span>
                </h4>
                <span className="text-[11px] text-gray-400">Auto-detected roles can be manually corrected</span>
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
                  { role: 'regionField', label: 'Region / Location', type: 'category/text' },
                  { role: 'categoryField', label: 'Category / Department', type: 'category' }
                ].map(item => (
                  <div key={item.role} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 border border-white/10">
                    <div>
                      <span className="text-xs font-semibold text-white block">{item.label}</span>
                      <span className="text-[10px] text-gray-500 font-mono">Expected: {item.type}</span>
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
                      <option value="">-- None --</option>
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

            {/* Column Schema Badges Preview */}
            <div>
              <span className="text-[11px] font-semibold text-gray-400 block mb-2">Detected Column Badges:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {stagedDataset.columns.map(c => (
                  <span
                    key={c.name}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono border bg-gray-900/80 border-white/10 text-gray-300 flex items-center gap-1.5"
                  >
                    <span className="font-semibold text-white">{c.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 uppercase font-bold">{c.type}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStagedDataset(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
              >
                Back to Upload
              </button>
              <button
                type="button"
                onClick={handleConfirmDataset}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Generate Dashboard Now</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
