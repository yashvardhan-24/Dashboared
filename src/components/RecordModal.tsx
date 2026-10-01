import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Save, Trash2 } from 'lucide-react';
import type { DetectedColumn } from '../types/dashboard';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recordData: Record<string, any>, originalRecord?: Record<string, any>) => void;
  onDelete?: (recordData: Record<string, any>) => void;
  columns: DetectedColumn[];
  initialData?: Record<string, any> | null;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  columns,
  initialData
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      const defaultState: Record<string, any> = {};
      columns.forEach(col => {
        if (col.type === 'number' || col.type === 'currency' || col.type === 'percentage') {
          defaultState[col.name] = 0;
        } else if (col.type === 'date') {
          defaultState[col.name] = new Date().toISOString().slice(0, 10);
        } else {
          defaultState[col.name] = '';
        }
      });
      setFormData(defaultState);
    }
  }, [initialData, columns, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, initialData || undefined);
    onClose();
  };

  const isEditMode = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-900/90 text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              {isEditMode ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">{isEditMode ? 'Edit Data Record' : 'Create New Record'}</h3>
              <p className="text-xs text-gray-400">Specify column values to insert/update in dataset</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {columns.map(col => {
              const val = formData[col.name] !== undefined ? formData[col.name] : '';

              return (
                <div key={col.name} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300 capitalize">
                    {col.name}
                    <span className="text-[10px] text-cyan-400 ml-1 font-mono">({col.type})</span>
                  </label>

                  {col.type === 'date' ? (
                    <input
                      type="date"
                      value={String(val).slice(0, 10)}
                      onChange={e => setFormData({ ...formData, [col.name]: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  ) : col.type === 'number' || col.type === 'currency' || col.type === 'percentage' ? (
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={e => setFormData({ ...formData, [col.name]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={e => setFormData({ ...formData, [col.name]: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:border-cyan-400 focus:outline-none font-sans"
                      placeholder={`Enter ${col.name}...`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {isEditMode && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (initialData) onDelete(initialData);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Record
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-xs font-semibold hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isEditMode ? 'Save Changes' : 'Add Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
