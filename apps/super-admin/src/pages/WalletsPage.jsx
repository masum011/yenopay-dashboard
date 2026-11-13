import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal, Wallet } from 'lucide-react';
import {
  Button,
  DataTable,
  Dropdown,
  Input,
  Modal,
  PageHeader,
  StatCard,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import { formatDateTime, formatINR, validateAmount } from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function WalletsPage() {
  const { retailers, walletLedger, adjustWallet } = useAdminStore();
  const { notify } = useNotification();

  const [tab, setTab] = useState('balances');
  const [search, setSearch] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);

  const [form, setForm] = useState({
    retailerId: retailers[0]?.id || '',
    direction: 'credit',
    amount: '',
    referenceNo: '',
    narration: '',
  });
  const [formError, setFormError] = useState('');

  const totalPool = useMemo(
    () => retailers.reduce((sum, r) => sum + r.walletBalance, 0),
    [retailers]
  );
  const totalLien = useMemo(
    () => retailers.reduce((sum, r) => sum + r.lienBalance, 0),
    [retailers]
  );

  const filteredRetailers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return retailers.filter(
      (r) =>
        !q ||
        r.outletName.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q)
    );
  }, [retailers, search]);

  const filteredLedger = useMemo(() => {
    const q = search.trim().toLowerCase();
    return walletLedger.filter(
      (l) =>
        !q ||
        l.retailerName.toLowerCase().includes(q) ||
        l.referenceNo.toLowerCase().includes(q) ||
        l.narration.toLowerCase().includes(q)
    );
  }, [walletLedger, search]);

  const openAdjustForRetailer = (retailer) => {
    setForm({
      retailerId: retailer.id,
      direction: 'credit',
      amount: '',
      referenceNo: `ADJ-${Date.now().toString().slice(-6)}`,
      narration: '',
    });
    setFormError('');
    setAdjustOpen(true);
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const amtErr = validateAmount(form.amount, 1, 1000000);
    if (amtErr) {
      setFormError(amtErr);
      return;
    }
    if (!form.referenceNo.trim() || !form.narration.trim()) {
      setFormError('Reference number and narration are required.');
      return;
    }

    const result = adjustWallet(form);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    notify({
      type: 'success',
      title: 'Wallet adjusted',
      message: `${form.direction === 'credit' ? 'Credited' : 'Debited'} ${formatINR(
        form.amount
      )} successfully.`,
    });
    setAdjustOpen(false);
  };

  const balanceColumns = [
    {
      key: 'code',
      header: 'Retailer',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {r.code}
          </span>
          <p className="text-xs font-medium text-slate-800">{r.outletName}</p>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Owner',
      render: (r) => (
        <span className="text-xs text-slate-600">
          {r.ownerName} · {r.city}
        </span>
      ),
    },
    {
      key: 'walletBalance',
      header: 'Available Balance',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatINR(r.walletBalance)}
        </span>
      ),
    },
    {
      key: 'lienBalance',
      header: 'Lien / Hold',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs text-amber-700">
          {formatINR(r.lienBalance)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Account',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Adjustment',
      align: 'right',
      render: (r) => (
        <Button
          variant="secondary"
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => openAdjustForRetailer(r)}
        >
          Adjust
        </Button>
      ),
    },
  ];

  const ledgerColumns = [
    {
      key: 'id',
      header: 'Entry ID',
      render: (l) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {l.id}
        </span>
      ),
    },
    {
      key: 'retailerName',
      header: 'Retailer',
      render: (l) => (
        <div>
          <p className="font-medium text-slate-900">{l.retailerName}</p>
          <p className="text-xs text-slate-500">{l.narration}</p>
        </div>
      ),
    },
    {
      key: 'referenceNo',
      header: 'Reference',
      render: (l) => (
        <span className="font-mono text-xs text-slate-600">{l.referenceNo}</span>
      ),
    },
    {
      key: 'direction',
      header: 'Type',
      render: (l) => <StatusBadge status={l.direction} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (l) => (
        <span
          className={`font-mono font-semibold ${
            l.direction === 'credit' ? 'text-emerald-700' : 'text-slate-900'
          }`}
        >
          {l.direction === 'credit' ? '+' : '−'}
          {formatINR(l.amount)}
        </span>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'Closing Balance',
      align: 'right',
      render: (l) => (
        <span className="font-mono text-xs text-slate-700">
          {formatINR(l.balanceAfter)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (l) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(l.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet Management"
        subtitle="Monitor retailer float balances, lien holds, credit/debit ledger entries, and manual adjustments."
        actions={
          <Button
            variant="primary"
            icon={SlidersHorizontal}
            onClick={() => {
              if (retailers[0]) openAdjustForRetailer(retailers[0]);
            }}
          >
            Wallet Adjustment
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Retailer Wallet Pool"
          value={formatINR(totalPool)}
          subtext={`Across ${retailers.length} merchant wallets`}
          icon={Wallet}
          accent="cyan"
        />
        <StatCard
          title="Total Lien / Hold Amount"
          value={formatINR(totalLien)}
          subtext="Compliance & settlement locks"
          icon={ArrowUpRight}
          accent="amber"
        />
        <StatCard
          title="Ledger Entries Logged"
          value={String(walletLedger.length)}
          subtext="Immutable credit & debit trail"
          icon={ArrowDownLeft}
          accent="teal"
        />
      </div>

      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab('balances')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            tab === 'balances'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Retailer Wallets
        </button>
        <button
          type="button"
          onClick={() => setTab('ledger')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            tab === 'ledger'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Credit / Debit History
        </button>
      </div>

      <DataTable
        columns={tab === 'balances' ? balanceColumns : ledgerColumns}
        data={tab === 'balances' ? filteredRetailers : filteredLedger}
        toolbar={
          <div className="w-full sm:max-w-xs">
            <Input
              icon={Search}
              placeholder={
                tab === 'balances'
                  ? 'Search retailer code or outlet...'
                  : 'Search reference, narration, outlet...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      {/* Wallet Adjustment Modal */}
      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Manual Wallet Adjustment"
        subtitle="Credit or debit a retailer float balance with mandatory audit reference."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="wallet-adjust-form">
              Apply Adjustment
            </Button>
          </>
        }
      >
        <form id="wallet-adjust-form" onSubmit={handleAdjustSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {formError}
            </div>
          )}

          <Dropdown
            label="Select Retailer"
            required
            value={form.retailerId}
            onChange={(e) => setForm({ ...form, retailerId: e.target.value })}
            options={retailers.map((r) => ({
              value: r.id,
              label: `${r.code} — ${r.outletName} (${formatINR(r.walletBalance)})`,
            }))}
          />

          <Dropdown
            label="Adjustment Type"
            required
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
            options={[
              { value: 'credit', label: 'Credit (Add Funds to Wallet)' },
              { value: 'debit', label: 'Debit (Deduct Funds from Wallet)' },
            ]}
          />

          <Input
            label="Amount (₹)"
            type="number"
            required
            min="1"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="e.g. 25000"
          />

          <Input
            label="Bank / Audit Reference No."
            required
            value={form.referenceNo}
            onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
            placeholder="NEFT / IMPS / Ticket ID"
          />

          <Input
            label="Narration / Reason"
            required
            value={form.narration}
            onChange={(e) => setForm({ ...form, narration: e.target.value })}
            placeholder="e.g. Verified NEFT deposit clearance"
          />
        </form>
      </Modal>
    </div>
  );
}
