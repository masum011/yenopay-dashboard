import React, { useMemo, useState } from 'react';
import { Landmark, Plus, Search, Wallet } from 'lucide-react';
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
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';

export function RetailerWalletPage() {
  const { wallet, walletHistory, fundRequests, submitFundRequest } =
    useRetailerStore();
  const { notify } = useNotification();

  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [addFundsOpen, setAddFundsOpen] = useState(false);

  const [fundForm, setFundForm] = useState({
    mode: 'NEFT / Virtual Account',
    amount: '',
    utr: '',
  });
  const [fundError, setFundError] = useState('');

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    return walletHistory.filter((item) => {
      const matchesDir =
        directionFilter === 'all' || item.direction === directionFilter;
      const matchesQ =
        !q ||
        item.referenceNo.toLowerCase().includes(q) ||
        item.narration.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchesDir && matchesQ;
    });
  }, [walletHistory, search, directionFilter]);

  const handleFundSubmit = (e) => {
    e.preventDefault();
    const amtErr = validateAmount(fundForm.amount, 500, 1000000);
    if (amtErr) {
      setFundError(amtErr);
      return;
    }
    if (!fundForm.utr.trim() || fundForm.utr.trim().length < 6) {
      setFundError('Enter the bank UTR / reference number for verification.');
      return;
    }
    setFundError('');
    const created = submitFundRequest(fundForm);
    setAddFundsOpen(false);
    setFundForm({ mode: 'NEFT / Virtual Account', amount: '', utr: '' });
    notify({
      type: 'success',
      title: 'Load request submitted',
      message: `Request ${created.id} queued for treasury verification (V1).`,
    });
  };

  const columns = [
    {
      key: 'id',
      header: 'Entry ID',
      render: (w) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {w.id}
        </span>
      ),
    },
    {
      key: 'narration',
      header: 'Narration & Reference',
      render: (w) => (
        <div>
          <p className="font-medium text-slate-900">{w.narration}</p>
          <p className="font-mono text-xs text-slate-500">{w.referenceNo}</p>
        </div>
      ),
    },
    {
      key: 'direction',
      header: 'Type',
      render: (w) => <StatusBadge status={w.direction} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (w) => (
        <span
          className={`font-mono font-semibold ${
            w.direction === 'credit' ? 'text-emerald-700' : 'text-slate-900'
          }`}
        >
          {w.direction === 'credit' ? '+' : '−'}
          {formatINR(w.amount)}
        </span>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'Closing Balance',
      align: 'right',
      render: (w) => (
        <span className="font-mono text-xs text-slate-700">
          {formatINR(w.balanceAfter)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (w) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(w.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet Management"
        subtitle="Track available working balance, submit bank load requests, and inspect credit/debit ledger history."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setAddFundsOpen(true)}
          >
            Add Funds
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Available Wallet Balance"
          value={formatINR(wallet.availableBalance)}
          subtext="Ready for DMT, BBPS, and payouts"
          icon={Wallet}
          accent="cyan"
        />
        <StatCard
          title="Pending Settlements"
          value={formatINR(wallet.pendingSettlements)}
          subtext="In payout clearance queue"
          icon={Landmark}
          accent="amber"
        />
        <StatCard
          title="Lien / Hold Amount"
          value={formatINR(wallet.lienAmount)}
          subtext="Reserved compliance hold"
          accent="navy"
        />
      </div>

      {/* Recent Load Requests */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Wallet Top-Up Requests
          </h2>
          <span className="text-xs text-slate-500">
            Virtual Account: <strong className="font-mono text-slate-800">YNPY10042</strong> · IFSC: <strong className="font-mono text-slate-800">ICIC0000104</strong>
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {fundRequests.map((req) => (
            <div
              key={req.id}
              className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs"
            >
              <div>
                <span className="font-mono font-semibold text-slate-900">
                  {req.id}
                </span>{' '}
                · <span className="text-slate-600">{req.mode}</span> ·{' '}
                <span className="font-mono text-slate-500">UTR: {req.utr}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-slate-900">
                  {formatINR(req.amount)}
                </span>
                <StatusBadge status={req.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredHistory}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                icon={Search}
                placeholder="Search narration or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Dropdown
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Entries' },
                  { value: 'credit', label: 'Credits Only' },
                  { value: 'debit', label: 'Debits Only' },
                ]}
              />
            </div>
          </div>
        }
      />

      <Modal
        open={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
        title="Submit Wallet Load Request"
        subtitle="Record bank transfer UTR to request wallet top-up verification."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddFundsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="add-funds-form">
              Submit Request
            </Button>
          </>
        }
      >
        <form id="add-funds-form" onSubmit={handleFundSubmit} className="space-y-4">
          {fundError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {fundError}
            </div>
          )}
          <Dropdown
            label="Deposit Channel"
            value={fundForm.mode}
            onChange={(e) => setFundForm({ ...fundForm, mode: e.target.value })}
            options={[
              'NEFT / Virtual Account',
              'IMPS Bank Transfer',
              'RTGS Corporate Deposit',
            ]}
          />
          <Input
            label="Transferred Amount (₹)"
            type="number"
            required
            min="500"
            value={fundForm.amount}
            onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
            placeholder="e.g. 25000"
          />
          <Input
            label="Bank UTR / Reference Number"
            required
            value={fundForm.utr}
            onChange={(e) =>
              setFundForm({ ...fundForm, utr: e.target.value.toUpperCase() })
            }
            placeholder="e.g. IMPS631400991122"
          />
        </form>
      </Modal>
    </div>
  );
}
