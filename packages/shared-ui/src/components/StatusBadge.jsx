import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  PauseCircle,
  ShieldCheck,
} from 'lucide-react';

const STATUS_MAP = {
  success: {
    label: 'Success',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  settled: {
    label: 'Settled',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  active: {
    label: 'Active',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  verified: {
    label: 'Verified',
    classes: 'bg-teal-50 text-teal-700 border-teal-200',
    Icon: ShieldCheck,
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: Clock,
  },
  processing: {
    label: 'Processing',
    classes: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    classes: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Icon: Clock,
  },
  open: {
    label: 'Open',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertCircle,
  },
  failed: {
    label: 'Failed',
    classes: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
  suspended: {
    label: 'Suspended',
    classes: 'bg-red-50 text-red-700 border-red-200',
    Icon: PauseCircle,
  },
  inactive: {
    label: 'Inactive',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
    Icon: PauseCircle,
  },
  credit: {
    label: 'Credit',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  debit: {
    label: 'Debit',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    Icon: AlertCircle,
  },
};

export function StatusBadge({ status, label }) {
  const key = String(status || '').toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_MAP[key] || {
    label: label || status || 'Unknown',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    Icon: AlertCircle,
  };
  const Icon = config.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${config.classes}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label || config.label}</span>
    </span>
  );
}
