import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import type { CompanyBranding, FieldMapping } from '../types/dashboard';

interface SidebarProps {
  branding: CompanyBranding;
  activeTab: string;
  onTabChange: (tab: string) => void;
  mapping: FieldMapping;
}

export const Sidebar: React.FC<SidebarProps> = ({
  branding,
  activeTab,
  onTabChange,
  mapping
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Dynamically determine navigation items based on available mapping fields
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, alwaysShow: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, alwaysShow: true },
    { id: 'reports', label: 'Reports', icon: FileText, alwaysShow: true },
    { id: 'sales', label: 'Sales', icon: ShoppingBag, showIf: Boolean(mapping.revenueField || mapping.ordersField) },
    { id: 'customers', label: 'Customers', icon: Users, showIf: Boolean(mapping.customerField) },
    { id: 'products', label: 'Products', icon: Package, showIf: Boolean(mapping.productField) },
    { id: 'finance', label: 'Finance', icon: DollarSign, showIf: Boolean(mapping.profitField || mapping.expenseField) },
    { id: 'activity', label: 'Activity', icon: Activity, alwaysShow: true },
    { id: 'audit', label: 'Audit Log', icon: Shield, alwaysShow: true },
    { id: 'settings', label: 'Settings', icon: Settings, alwaysShow: true }
  ];

  const visibleNavItems = allNavItems.filter(item => item.alwaysShow || item.showIf);

  return (
    <aside
      className={`relative z-20 glass-panel border-r border-white/10 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg shadow-cyan-500/20">
                {branding.initials}
              </div>
              <div className="truncate">
                <h2 className="font-bold text-sm text-white truncate tracking-tight">{branding.companyName}</h2>
                <p className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase truncate">{branding.industry}</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20">
              {branding.initials}
            </div>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-gray-900/60 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all ml-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-2 space-y-1 mt-2">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border border-cyan-500/20 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Enterprise Ready</span>
            </div>
            <p className="text-[10px] text-gray-400">Dynamic Schema Engine v2.4 Active</p>
          </div>
        </div>
      )}
    </aside>
  );
};
