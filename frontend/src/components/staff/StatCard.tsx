import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  accentClass?: string;
}

export function StatCard({
  title,
  value,
  icon,
  change,
  trend = 'neutral',
  accentClass = 'bg-brand-red/10 text-brand-red',
}: StatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-error' : 'text-neutral-600';

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-neutral-900 mt-2">{value}</p>
        {change && (
          <p className={`text-xs font-medium mt-1 ${trendColor}`}>{change}</p>
        )}
      </div>
      {icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClass}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
