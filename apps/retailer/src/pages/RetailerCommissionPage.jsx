import React from 'react';
import { IndianRupee, Percent, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DataTable, PageHeader, StatCard, StatusBadge } from '@yenopay/shared-ui';
import { formatDateTime, formatINR } from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';
import { RETAILER_WEEKLY_ANALYTICS } from '../services/mockRetailerData.js';

export function RetailerCommissionPage() {
  const { transactions, overviewStats, profile } = useRetailerStore();

  const commissionHistory = transactions.filter((t) => t.status === 'success');

  const columns = [
    {
      key: 'id',
      header: 'TXN ID',
      render: (t) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {t.id}
        </span>
      ),
    },
    {
      key: 'service',
      header: 'Service & Operation',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">
            {t.service} · {t.subType}
          </p>
          <p className="text-xs text-slate-500">{t.bankName}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Txn Amount',
      align: 'right',
      render: (t) => (
        <span className="font-mono text-slate-700">{formatINR(t.amount)}</span>
      ),
    },
    {
      key: 'commission',
      header: 'Commission Credited',
      align: 'right',
      sortable: true,
      render: (t) => (
        <span className="font-mono font-semibold text-emerald-700">
          +{formatINR(t.commission)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="settled" label="Credited" />,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (t) => (
        <span className="text-xs text-slate-500">{formatDateTime(t.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Management"
        subtitle={`Active Plan: ${profile.commissionPlan} · Daily and cumulative commission earnings.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Today's Commission"
          value={formatINR(overviewStats.todayEarnings)}
          trend="+11.2% vs yesterday"
          trendDirection="up"
          icon={IndianRupee}
          accent="teal"
        />
        <StatCard
          title="Total Earnings (Current Log)"
          value={formatINR(overviewStats.totalEarnings)}
          subtext="Credited directly to wallet"
          icon={TrendingUp}
          accent="cyan"
        />
        <StatCard
          title="Active Commission Tier"
          value={profile.commissionPlan}
          subtext="Up to ₹12 flat on AEPS slabs"
          icon={Percent}
          accent="navy"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-base font-semibold text-slate-900">
          7-Day Commission Trend
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Daily commission payouts earned across banking & bill payment services
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={RETAILER_WEEKLY_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${v}`}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(v) => [formatINR(v), 'Commission']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="earnings" fill="#0891B2" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">
          Commission History
        </h2>
        <DataTable columns={columns} data={commissionHistory} />
      </div>
    </div>
  );
}
