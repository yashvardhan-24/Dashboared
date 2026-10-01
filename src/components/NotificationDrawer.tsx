import React from 'react';
import { Bell, X, Check, Trash2, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import type { NotificationItem } from '../types/dashboard';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onMarkRead
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md h-full border-l border-white/10 shadow-2xl bg-slate-950/95 text-white flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base">Notifications & System Telemetry</h3>
              <p className="text-xs text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread system notifications` : 'All notifications read'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-3 border-b border-white/10 bg-slate-900/40 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="text-cyan-400 hover:text-cyan-300 font-semibold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="text-rose-400 hover:text-rose-300 font-semibold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <Bell className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs font-semibold text-gray-400">No notifications to display</p>
              <p className="text-[11px] text-gray-500">System actions and live data events will trigger alerts here.</p>
            </div>
          ) : (
            notifications.map(item => {
              let icon = <Info className="w-4 h-4 text-cyan-400" />;
              let borderColor = 'border-cyan-500/20';

              if (item.type === 'success') {
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                borderColor = 'border-emerald-500/20';
              } else if (item.type === 'warning') {
                icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
                borderColor = 'border-amber-500/20';
              } else if (item.type === 'error') {
                icon = <AlertCircle className="w-4 h-4 text-rose-400" />;
                borderColor = 'border-rose-500/20';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onMarkRead(item.id)}
                  className={`p-3.5 rounded-2xl border ${borderColor} ${
                    item.read ? 'bg-slate-900/40 opacity-75' : 'bg-slate-900/90 shadow-lg'
                  } hover:border-purple-500/30 transition-all cursor-pointer flex items-start gap-3`}
                >
                  <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-semibold text-xs text-white truncate">{item.title}</h4>
                      <span className="text-[10px] text-gray-500 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{item.message}</p>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-2 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
