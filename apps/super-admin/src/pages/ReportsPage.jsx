import React, { useState } from 'react';
import { Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button, PageHeader, StatCard, useNotification } from '@yenopay/shared-ui';
import { exportToCsv, formatINR } from '@yenopay/shared-utils';
import {
  ANALYTICS_TREND_7D,
  ANALYTICS_TREND_30D,
  SERVICE_MIX_DATA,
} from '../services/mockAdminData.js';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function ReportsPage() {
  const [reportType, setReportType] = useState('daily');
  const { transactions } = useAdminStore();
  const { notify } = useNotification();

  const trendSeries =
    reportType === 'monthly' ? ANALYTICS_TREND_30D : ANALYTICS_TREND_7D;

  const handleDownload = () => {
    if (reportType === 'transactions') {
      exportToCsv('yenopay-transaction-report.csv', transactions);
    } else if (reportType === 'revenue') {
      exportToCsv('yenopay-revenue-report.csv', trendSeries);
    } else {
      exportToCsv(`yenopay-${reportType}-report.csv`, trendSeries);
    }
    notify({
      type: 'success',
      title: 'Report downloaded',
      message: `Generated ${reportType} report CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Daily, monthly, transaction, and net revenue performance across YenoPay."
        actions={
          <Button variant="primary" icon={Download} onClick={handleDownload}>
            Download CSV Report
          </Button>
        }
      />

      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {[
          { id: 'daily', label: 'Daily Reports' },
          { id: 'monthly', label: 'Monthly Reports' },
          { id: 'transactions', label: 'Transaction Reports' },
          { id: 'revenue', label: 'Revenue Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setReportType(tab.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              reportType === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="30-Day Gross Volume"
          value={formatINR(58830000, { compact: true })}
          trend="+16.8% MoM"
          trendDirection="up"
          accent="cyan"
        />
        <StatCard
          title="30-Day Platform Revenue"
          value={formatINR(466400)}
          trend="+14.1% MoM"
          trendDirection="up"
          accent="teal"
        />
        <StatCard
          title="Average Ticket Size"
          value={formatINR(3018)}
          subtext="Across 19,487 transactions"
          accent="navy"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            {reportType === 'monthly'
              ? 'Weekly Volume Trajectory (30D)'
              : 'Daily Volume Trajectory (7D)'}
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Processed INR value across active banking rails
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(v) => [formatINR(v), 'Volume']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="volume" fill="#0891B2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Net Platform Revenue Curve
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Platform margin earned after retailer & distributor payouts
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(v) => [formatINR(v), 'Net Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#0F766E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-slate-900">
          Service-Wise Volume Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-2.5">Service Vertical</th>
                <th className="py-2.5 text-right">30D Volume</th>
                <th className="py-2.5 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SERVICE_MIX_DATA.map((row) => (
                <tr key={row.service}>
                  <td className="py-3 font-medium text-slate-900">{row.service}</td>
                  <td className="py-3 text-right font-mono text-slate-800 tabular-nums">
                    {formatINR(row.volume)}
                  </td>
                  <td className="py-3 text-right font-mono text-teal-700 tabular-nums">
                    {row.share}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
