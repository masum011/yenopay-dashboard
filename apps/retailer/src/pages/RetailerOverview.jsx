import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  IndianRupee,
  ArrowLeftRight,
  CheckCircle2,
  Landmark,
  Fingerprint,
  Send,
  ReceiptText,
  CreditCard,
  Banknote,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button, PageHeader, StatCard, StatusBadge } from '@yenopay/shared-ui';
import { formatDateTime, formatINR, formatNumber } from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';
import { RETAILER_WEEKLY_ANALYTICS } from '../services/mockRetailerData.js';
import { TransactionReceiptModal } from '../components/TransactionReceiptModal.jsx';

const QUICK_SERVICES = [
  {
    to: 'aeps',
    title: 'AEPS Cash & Enquiry',
    subtitle: 'Aadhaar biometric withdrawal & mini statement',
    icon: Fingerprint,
  },
  {
    to: 'dmt',
    title: 'Money Transfer (DMT)',
    subtitle: 'IMPS & NEFT transfers to bank accounts',
    icon: Send,
  },
  {
    to: 'bill-payments',
    title: 'BBPS & Recharges',
    subtitle: 'Electricity, gas, broadband, mobile & DTH',
    icon: ReceiptText,
  },
  {
    to: 'micro-atm',
    title: 'Micro ATM',
    subtitle: 'Debit card cash withdrawal & balance check',
    icon: CreditCard,
  },
  {
    to: 'cash-deposit',
    title: 'Cash Deposit',
    subtitle: 'Supported partner bank cash deposits',
    icon: Banknote,
  },
];

export function RetailerOverview() {
  const navigate = useNavigate();
  const { profile, wallet, transactions, overviewStats } = useRetailerStore();
  const [receiptTxn, setReceiptTxn] = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile.ownerName.split(' ')[0]}`}
        subtitle={`${profile.outletName} · ${profile.code} · ${profile.city}, ${profile.state}`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('transactions')}
            >
              View Statement
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('wallet')}
            >
              Add Funds
            </Button>
          </>
        }
      />

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Available Wallet Balance"
          value={formatINR(wallet.availableBalance)}
          subtext={`Lien hold: ${formatINR(wallet.lienAmount)}`}
          icon={Wallet}
          accent="cyan"
          onClick={() => navigate('wallet')}
        />
        <StatCard
          title="Today's Earnings"
          value={formatINR(overviewStats.todayEarnings)}
          trend="+11.2% vs yesterday"
          trendDirection="up"
          icon={IndianRupee}
          accent="teal"
          onClick={() => navigate('commissions')}
        />
        <StatCard
          title="Today's Transactions"
          value={formatNumber(overviewStats.todayTxnsCount)}
          subtext="Processed since 00:00 IST"
          icon={ArrowLeftRight}
          accent="navy"
          onClick={() => navigate('transactions')}
        />
        <StatCard
          title="Successful Transactions"
          value={`${overviewStats.successCount} / ${overviewStats.totalCount}`}
          trend={`${Math.round(
            (overviewStats.successCount / Math.max(1, overviewStats.totalCount)) *
              100
          )}% success`}
          trendDirection="up"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Pending Settlements"
          value={formatINR(wallet.pendingSettlements)}
          subtext="Queued for bank payout"
          icon={Landmark}
          accent="amber"
          onClick={() => navigate('wallet')}
        />
      </div>

      {/* Quick Banking Services Launchpad */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Quick Banking Services
          </h2>
          <span className="text-xs text-slate-500">
            Select a rail to open service counter
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <button
                key={svc.to}
                type="button"
                onClick={() => navigate(svc.to)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-cyan-400 hover:bg-cyan-50/25 cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-cyan-400 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3.5">
                  <p className="font-display text-sm font-semibold text-slate-900">
                    {svc.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {svc.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Analytics + Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                7-Day Transaction Volume
              </h2>
              <p className="text-xs text-slate-500">
                Daily customer banking throughput at your outlet
              </p>
            </div>
            <span className="font-mono text-xs font-medium text-teal-700">
              {formatINR(
                RETAILER_WEEKLY_ANALYTICS.reduce((a, b) => a + b.volume, 0)
              )}{' '}
              weekly
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RETAILER_WEEKLY_ANALYTICS}>
                <defs>
                  <linearGradient id="retVolFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
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
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(v, key) => [
                    formatINR(v),
                    key === 'volume' ? 'Volume' : 'Commission',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#0D9488"
                  strokeWidth={2.2}
                  fill="url(#retVolFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Recent Transactions
            </h2>
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
              <button
                key={txn.id}
                type="button"
                onClick={() => setReceiptTxn(txn)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {txn.service} · {txn.subType}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {txn.customerName} · {formatDateTime(txn.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {formatINR(txn.amount)}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <TransactionReceiptModal
        transaction={receiptTxn}
        profile={profile}
        onClose={() => setReceiptTxn(null)}
      />
    </div>
  );
}
