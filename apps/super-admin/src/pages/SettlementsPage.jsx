import React, { useMemo, useState } from 'react';
import { CheckCircle2, Landmark, Search } from 'lucide-react';
import {
  Button,
  DataTable,
  Input,
  Modal,
  PageHeader,
  StatCard,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import { formatDateTime, formatINR, maskAccountNumber } from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function SettlementsPage() {
  const { settlements, processSettlement } = useAdminStore();
  const { notify } = useNotification();

  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [utrInput, setUtrInput] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return settlements.filter((s) => {
      const matchesTab =
        tab === 'history'
          ? true
          : tab === 'pending'
          ? s.status === 'pending'
          : s.status === 'settled';
      const matchesSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.retailerName.toLowerCase().includes(q) ||
        s.retailerCode.toLowerCase().includes(q) ||
        s.bankName.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [settlements, tab, search]);

  const pendingTotal = useMemo(
    () =>
      settlements
        .filter((s) => s.status === 'pending')
        .reduce((acc, s) => acc + s.amount, 0),
    [settlements]
  );

  const settledTotal = useMemo(
    () =>
      settlements
        .filter((s) => s.status === 'settled')
        .reduce((acc, s) => acc + s.amount, 0),
    [settlements]
  );

  const openSettleModal = (settlement) => {
    setSelectedSettlement(settlement);
    setUtrInput(`IMPS${Date.now().toString().slice(-10)}`);
  };

  const handleAction = (nextStatus) => {
    if (!selectedSettlement) return;
    processSettlement(selectedSettlement.id, nextStatus, utrInput);
    notify({
      type: nextStatus === 'settled' ? 'success' : 'info',
      title:
        nextStatus === 'settled' ? 'Settlement marked settled' : 'Settlement rejected',
      message: `${selectedSettlement.id} (${formatINR(
        selectedSettlement.amount
      )}) updated.`,
    });
    setSelectedSettlement(null);
  };

  const columns = [
    {
      key: 'id',
      header: 'Settlement Ref',
      render: (s) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {s.id}
          </span>
          <p className="text-[11px] text-slate-500">{s.mode}</p>
        </div>
      ),
    },
    {
      key: 'retailerName',
      header: 'Retailer',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900">{s.retailerName}</p>
          <p className="font-mono text-[11px] text-slate-500">{s.retailerCode}</p>
        </div>
      ),
    },
    {
      key: 'bankName',
      header: 'Destination Bank',
      render: (s) => (
        <div>
          <p className="text-xs font-medium text-slate-800">{s.bankName}</p>
          <p className="font-mono text-[11px] text-slate-500">
            {maskAccountNumber(s.accountNumber)} · {s.ifsc}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Payout Amount',
      align: 'right',
      sortable: true,
      render: (s) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatINR(s.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      render: (s) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(s.requestedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) =>
        s.status === 'pending' ? (
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={(e) => {
              e.stopPropagation();
              openSettleModal(s);
            }}
          >
            Process
          </Button>
        ) : (
          <span className="font-mono text-[11px] text-slate-500">
            {s.utr || '—'}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlement Management"
        subtitle="Review retailer bank payout requests, verify destination accounts, and manage settlement batches."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending Payout Queue"
          value={formatINR(pendingTotal)}
          subtext={`${
            settlements.filter((s) => s.status === 'pending').length
          } awaiting approval`}
          icon={Landmark}
          accent="amber"
        />
        <StatCard
          title="Completed Settlements"
          value={formatINR(settledTotal)}
          subtext="Cleared IMPS & NEFT batches"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Total Settlement Requests"
          value={String(settlements.length)}
          subtext="Current cycle"
          accent="navy"
        />
      </div>

      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {[
          { id: 'pending', label: 'Pending Settlements' },
          { id: 'completed', label: 'Completed Settlements' },
          { id: 'history', label: 'Full History' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              tab === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        toolbar={
          <div className="w-full sm:max-w-xs">
            <Input
              icon={Search}
              placeholder="Search settlement ref, retailer, bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <Modal
        open={Boolean(selectedSettlement)}
        onClose={() => setSelectedSettlement(null)}
        title={
          selectedSettlement
            ? `Process Settlement ${selectedSettlement.id}`
            : ''
        }
        subtitle="V1 administrative queue review (no live bank payout executed)."
        size="md"
        footer={
          <>
            <Button variant="danger" onClick={() => handleAction('rejected')}>
              Reject Request
            </Button>
            <Button variant="primary" onClick={() => handleAction('settled')}>
              Mark as Settled
            </Button>
          </>
        }
      >
        {selectedSettlement && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs text-slate-500">Payout Amount</p>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {formatINR(selectedSettlement.amount)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {selectedSettlement.retailerName} ({selectedSettlement.retailerCode})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Bank Name</p>
                <p className="font-medium text-slate-900">{selectedSettlement.bankName}</p>
              </div>
              <div>
                <p className="text-slate-500">Account & IFSC</p>
                <p className="font-mono font-medium text-slate-900">
                  {maskAccountNumber(selectedSettlement.accountNumber)} ·{' '}
                  {selectedSettlement.ifsc}
                </p>
              </div>
            </div>
            <Input
              label="Settlement UTR / Reference Number"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
