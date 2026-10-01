import React, { useState } from 'react';
import { X, Building2, Image, DollarSign, Globe, Check } from 'lucide-react';
import type { CompanyBranding } from '../types/dashboard';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: CompanyBranding;
  onSave: (newBranding: CompanyBranding) => void;
}

export const BrandingModal: React.FC<BrandingModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSave
}) => {
  const [formData, setFormData] = useState<CompanyBranding>({ ...branding });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const currencyOptions = [
    { symbol: '$', code: 'USD', label: 'USD ($)' },
    { symbol: '€', code: 'EUR', label: 'EUR (€)' },
    { symbol: '£', code: 'GBP', label: 'GBP (£)' },
    { symbol: '₹', code: 'INR', label: 'INR (₹)' },
    { symbol: '¥', code: 'JPY', label: 'JPY (¥)' },
    { symbol: 'A$', code: 'AUD', label: 'AUD (A$)' },
    { symbol: 'C$', code: 'CAD', label: 'CAD (C$)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Company Branding</h3>
              <p className="text-xs text-gray-400">Configure dashboard identity & localization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Company Name */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Company Name</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({
                ...formData,
                companyName: e.target.value,
                initials: e.target.value.substring(0, 2).toUpperCase()
              })}
              className="w-full bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. ACME Corporation"
            />
          </div>

          {/* Dashboard Title & Subtitle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Dashboard Title</label>
              <input
                type="text"
                value={formData.dashboardTitle}
                onChange={(e) => setFormData({ ...formData, dashboardTitle: e.target.value })}
                className="w-full bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Business Analytics"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. E-Commerce / SaaS"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1 flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-cyan-400" />
              <span>Logo Image URL (Optional)</span>
            </label>
            <input
              type="url"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                <span>Currency</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => {
                  const sel = currencyOptions.find(c => c.symbol === e.target.value);
                  setFormData({
                    ...formData,
                    currency: e.target.value,
                    currencyCode: sel ? sel.code : 'USD'
                  });
                }}
                className="w-full bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {currencyOptions.map(c => (
                  <option key={c.code} value={c.symbol}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Timezone</span>
              </label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="UTC / America/New_York"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
