import React from 'react';
import type { CalculatedKPI } from '../types/dashboard';
import { KpiCard } from './KpiCard';

interface KpiGridProps {
  kpis: CalculatedKPI[];
  currencySymbol?: string;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis, currencySymbol = '$' }) => {
  if (kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map(kpi => (
        <KpiCard key={kpi.id} kpi={kpi} currencySymbol={currencySymbol} />
      ))}
    </div>
  );
};
