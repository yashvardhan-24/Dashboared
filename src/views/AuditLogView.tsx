import React from 'react';
import { ShieldCheck, Terminal } from 'lucide-react';
import type { SystemAuditLog } from '../types/dashboard';

interface AuditLogViewProps {
  logs: SystemAuditLog[];
  onClearLogs?: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-white text-xl tracking-tight">System Audit & Compliance Log</h2>
            <p className="text-xs text-gray-400">Real-time immutable logging of data mutations, role changes, and exports</p>
          </div>
        </div>

        {onClearLogs && (
          <button
            onClick={onClearLogs}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            Clear Audit History
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-base">Recorded System Events ({logs.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="sticky top-0 z-10 bg-slate-950/90 text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User Role</th>
                <th className="px-4 py-3">Event / Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 font-sans">
                    No system audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        log.userRole === 'Admin'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : log.userRole === 'Manager'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-white whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-2.5 text-gray-300">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
