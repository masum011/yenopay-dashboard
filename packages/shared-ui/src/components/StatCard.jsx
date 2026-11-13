import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtext,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  accent = 'cyan',
  onClick,
}) {
  const accentStyles = {
    cyan: 'bg-cyan-50 text-cyan-700',
    teal: 'bg-teal-50 text-teal-700',
    navy: 'bg-slate-100 text-slate-800',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors duration-150 ${
        onClick ? 'hover:border-cyan-300 hover:bg-slate-50/40 cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              accentStyles[accent] || accentStyles.cyan
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
                trendDirection === 'up'
                  ? 'text-emerald-700'
                  : trendDirection === 'down'
                  ? 'text-red-600'
                  : 'text-slate-600'
              }`}
            >
              {trendDirection === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
              {trendDirection === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend}
            </span>
          )}
          {trend && subtext && (
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
          )}
          {subtext && <span className="text-slate-500">{subtext}</span>}
        </div>
      )}
    </Component>
  );
}
