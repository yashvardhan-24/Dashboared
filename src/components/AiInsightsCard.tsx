import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';
import type { AiInsight } from '../utils/aiProcessor';

interface AiInsightsCardProps {
  insights: AiInsight[];
  onApplyRecommendation?: (rec: string) => void;
}

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-slate-900/40 to-cyan-950/20 shadow-xl relative overflow-hidden mb-6">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-500/10">
            <Sparkles className="w-5 h-5 animate-pulse text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
              Autonomous AI Executive Insights
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-semibold tracking-wide uppercase">
                Real-Time Synthesis
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automated telemetry analysis & prescriptive recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {insights.map(item => {
          let badgeColor = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
          let icon = <Info className="w-4 h-4 text-cyan-400" />;

          if (item.type === 'positive') {
            badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
            icon = <TrendingUp className="w-4 h-4 text-emerald-400" />;
          } else if (item.type === 'warning') {
            badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          } else if (item.type === 'prediction') {
            badgeColor = 'bg-purple-500/10 border-purple-500/30 text-purple-300';
            icon = <Compass className="w-4 h-4 text-purple-400" />;
          }

          return (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/60 hover:border-purple-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${badgeColor}`}>
                    {icon}
                    {item.type.toUpperCase()}
                  </span>

                  {item.changePct !== undefined && (
                    <span className={`text-xs font-bold flex items-center ${item.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.changePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(1)}%
                    </span>
                  )}
                </div>

                <h4 className="font-semibold text-slate-100 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.description}</p>
              </div>

              {item.recommendation && (
                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <span className="font-semibold text-purple-300 shrink-0">Action:</span>
                  <span>{item.recommendation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
