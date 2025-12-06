import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  colorClass?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, colorClass = "text-white", icon: Icon }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-5 rounded-xl shadow-sm hover:bg-slate-800 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</div>
        {Icon && <Icon className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />}
      </div>
      <div className="flex items-baseline gap-2">
        <div className={`text-3xl font-bold tracking-tight ${colorClass}`}>{value}</div>
      </div>
      {subtext && (
        <div className="text-slate-500 text-xs mt-2 flex items-center gap-1">
          {subtext}
        </div>
      )}
    </div>
  );
};

export default MetricCard;