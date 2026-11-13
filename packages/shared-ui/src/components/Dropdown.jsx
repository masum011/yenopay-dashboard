import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Dropdown({
  label,
  id,
  options = [],
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  className = '',
  disabled = false,
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`h-10 w-full appearance-none rounded-lg border bg-white pl-3 pr-9 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-slate-200 hover:border-slate-300 focus:border-cyan-600'
          } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const optionValue = typeof opt === 'object' ? opt.value : opt;
            const optionLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
