import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading records...', size = 'md', className = '' }) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';

  return (
    <div className={`flex flex-col items-center justify-center py-10 text-slate-500 ${className}`}>
      <Loader2 className={`${iconSize} animate-spin text-cyan-600`} />
      {label && <p className="mt-2.5 text-xs font-medium text-slate-500">{label}</p>}
    </div>
  );
}
