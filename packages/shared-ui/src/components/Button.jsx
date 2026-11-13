import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary:
    'bg-brand-gold-500 text-brand-purple-950 hover:bg-brand-gold-600 border border-brand-gold-500 shadow-xs focus-visible:ring-brand-gold-600',
  navy:
    'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-xs focus-visible:ring-slate-700',
  secondary:
    'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 focus-visible:ring-cyan-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus-visible:ring-cyan-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 border border-red-600 shadow-xs focus-visible:ring-red-500',
  outlineTeal:
    'bg-teal-50/70 text-teal-700 hover:bg-teal-100/80 border border-teal-200 focus-visible:ring-teal-500',
};

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
      } ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="h-4 w-4 shrink-0" />}
    </button>
  );
}
