import React, { useState } from 'react';
import { Activity, Search, ShoppingBag, CreditCard, UserCheck, Clock } from 'lucide-react';
import type { ActivityEvent } from '../types/dashboard';

interface ActivityViewProps {
  events: ActivityEvent[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = events.filter(e => {
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'payment': return CreditCard;
      case 'customer': return UserCheck;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live Event & Activity Ledger</h2>
            <p className="text-xs text-gray-400">Stream of data-driven events, transactions, and system checkpoints</p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>LIVE INGESTION ACTIVE</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'order', 'payment', 'customer'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white bg-gray-900/60 border border-white/5'
              }`}
            >
              {t} Events
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity stream..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Events Stream List */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white text-base">Recorded Transactions ({filtered.length})</h3>
          <span className="text-xs text-gray-400 font-mono">Stream synced</span>
        </div>

        <div className="space-y-2.5">
          {filtered.map(event => {
            const Icon = getEventIcon(event.type);
            return (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-white/20 transition-all hover:bg-gray-900/80"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-800 border border-white/10 text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                    <p className="text-xs text-gray-400">{event.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  {event.value && (
                    <span className="text-sm font-bold text-cyan-300 font-mono block">
                      {event.value}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500 flex items-center gap-1 justify-end font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{event.timestamp}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
