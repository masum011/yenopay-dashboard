import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  UserCheck,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Landmark,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Button,
  PageHeader,
  StatCard,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import { exportToCsv, formatDateTime, formatINR, formatNumber } from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';
import {
  ANALYTICS_TREND_7D,
  ANALYTICS_TREND_30D,
  SERVICE_MIX_DATA,
} from '../services/mockAdminData.js';

export function DashboardOverview() {
  const [range, setRange] = useState('7d');
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { overviewMetrics, transactions, auditLogs } = useAdminStore();

  const chartData = range === '7d' ? ANALYTICS_TREND_7D : ANALYTICS_TREND_30D;

  const handleExportSnapshot = () => {
    exportToCsv('yenopay-platform-transactions.csv', transactions, [
      { key: 'id', header: 'Transaction ID' },
      { key: 'utr', header: 'UTR' },
      { key: 'retailerName', header: 'Retailer' },
      { key: 'service', header: 'Service' },
      { key: 'amount', header: 'Amount (INR)' },
      { key: 'platformRevenue', header: 'Platform Revenue (INR)' },
      { key: 'status', header: 'Status' },
      { key: 'createdAt', header: 'Timestamp' },
    ]);
    notify({
      type: 'success',
      title: 'Report exported',
      message: 'Downloaded platform transaction snapshot CSV.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        subtitle="Real-time operational health, retailer activity, and settlement pipeline across YenoPay."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportSnapshot}
            >
              Export Snapshot
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('settlements')}
            >
              Review Settlements ({overviewMetrics.pendingSettlementCount})
            </Button>
          </>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Retailers"
          value={formatNumber(overviewMetrics.totalRetailers)}
          trend={`${overviewMetrics.activeRetailers} Active`}
          trendDirection="up"
          subtext="Across 4 distributors"
          icon={Store}
          accent="navy"
          onClick={() => navigate('retailers')}
        />
        <StatCard
          title="Active Retailers"
          value={formatNumber(overviewMetrics.activeRetailers)}
          trend={`${Math.round(
            (overviewMetrics.activeRetailers /
              Math.max(1, overviewMetrics.totalRetailers)) *
              100
          )}% active rate`}
          trendDirection="up"
          subtext="KYC & wallet enabled"
          icon={UserCheck}
          accent="teal"
          onClick={() => navigate('retailers')}
        />
        <StatCard
          title="Platform Revenue"
          value={formatINR(overviewMetrics.platformRevenue)}
          trend="+14.2% vs prior period"
          trendDirection="up"
          subtext="Net fee & margin"
          icon={IndianRupee}
          accent="cyan"
          onClick={() => navigate('reports')}
        />
        <StatCard
          title="Pending Settlements"
          value={formatINR(overviewMetrics.pendingSettlementsAmount)}
          subtext={`${overviewMetrics.pendingSettlementCount} payout requests queued`}
          icon={Landmark}
          accent="amber"
          onClick={() => navigate('settlements')}
        />
      </div>

      {/* Transaction Health Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Transactions"
          value={formatNumber(overviewMetrics.totalTxns)}
          subtext="All service rails combined"
          icon={ArrowLeftRight}
          accent="navy"
          onClick={() => navigate('transactions')}
        />
        <StatCard
          title="Successful Transactions"
          value={formatNumber(overviewMetrics.successTxns)}
          trend={`${Math.round(
            (overviewMetrics.successTxns / Math.max(1, overviewMetrics.totalTxns)) *
              100
          )}% success ratio`}
          trendDirection="up"
          subtext="Cleared & settled"
          icon={CheckCircle2}
          accent="emerald"
          onClick={() => navigate('transactions')}
        />
        <StatCard
          title="Failed & Pending Transactions"
          value={formatNumber(overviewMetrics.failedPendingTxns)}
          subtext="Requires reconciliation or retry"
          icon={AlertCircle}
          accent="red"
          onClick={() => navigate('transactions')}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Transaction Volume & Revenue
              </h2>
              <p className="text-xs text-slate-500">
                Gross processed volume (₹) across all active banking rails
              </p>
            </div>
            <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 self-start">
              <button
                type="button"
                onClick={() => setRange('7d')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  range === '7d'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setRange('30d')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  range === '30d'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ypVolumeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891B2" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [
                    name === 'volume' ? formatINR(value) : formatINR(value),
                    name === 'volume' ? 'Gross Volume' : 'Platform Revenue',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#0891B2"
                  strokeWidth={2.2}
                  fill="url(#ypVolumeFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Volume by Service
            </h2>
            <p className="text-xs text-slate-500">
              30-day distribution across payment verticals
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SERVICE_MIX_DATA}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="service"
                  tick={{ fontSize: 12, fill: '#334155' }}
                  axisLine={false}
                  tickLine={false}
                  width={88}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [formatINR(value, { compact: true }), 'Volume']}
                />
                <Bar dataKey="volume" fill="#0F766E" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {SERVICE_MIX_DATA.map((item) => (
              <div
                key={item.service}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-slate-600">{item.service}</span>
                <span className="font-mono font-medium text-slate-900 tabular-nums">
                  {formatINR(item.volume, { compact: true })} · {item.share}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Split: Recent Transactions & Recent Platform Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Latest Transactions
              </h2>
              <p className="text-xs text-slate-500">
                Most recent activity across AEPS, DMT, BBPS, and Cash rails
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('transactions')}
            >
              View all
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-medium text-slate-800">
                      {txn.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{txn.service}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{txn.subType}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                    {txn.retailerName}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {formatINR(txn.amount)}
                  </span>
                  <StatusBadge status={txn.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recent Platform Activity
              </h2>
              <p className="text-xs text-slate-500">Administrative & policy events</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('audit-logs')}
            >
              Logs
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="px-5 py-3.5">
                <p className="text-xs font-medium text-slate-900 leading-snug">
                  {log.action}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>{log.actorName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateTime(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
