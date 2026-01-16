
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
      <div className={`p-3 rounded-lg ${colorClass} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {change && (
          <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
            {change} from last week
          </p>
        )}
      </div>
    </div>
  );
};
