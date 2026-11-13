import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Try adjusting your search or filter criteria.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3.5 font-display text-sm font-semibold text-slate-900">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
