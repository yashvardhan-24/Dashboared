import React from 'react';
import type { ActivityEvent } from '../types/dashboard';
import { Activity, ShoppingBag, CreditCard, UserCheck, Clock } from 'lucide-react';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  if (events.length === 0) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'payment': return CreditCard;
      case 'customer': return UserCheck;
      default: return Activity;
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 mb-6">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Latest Transaction Activity</h3>
            <p className="text-xs text-gray-400">Real-time event stream from actual data records</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Live Stream</span>
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {events.map((event) => {
          const Icon = getEventIcon(event.type);
          return (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-white/20 transition-all hover:bg-gray-900/80 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-800 border border-white/10 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-500/40 transition-all">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-cyan-200 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-[11px] text-gray-400">{event.description}</p>
                </div>
              </div>

              <div className="text-right">
                {event.value && (
                  <span className="text-xs font-bold text-cyan-300 font-mono block">
                    {event.value}
                  </span>
                )}
                <span className="text-[10px] text-gray-500 flex items-center gap-1 justify-end font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{event.timestamp}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
