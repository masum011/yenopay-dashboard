import React, { useMemo, useState } from 'react';
import { Download, Eye, Search } from 'lucide-react';
import {
  Button,
  DataTable,
  Input,
  Modal,
  PageHeader,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import { exportToCsv, formatDateTime, formatINR } from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

const TABS = [
  { id: 'all', label: 'All Transactions' },
  { id: 'AEPS', label: 'AEPS' },
  { id: 'Money Transfer', label: 'Money Transfer' },
  { id: 'Cash Deposit', label: 'Cash Deposit' },
  { id: 'BBPS', label: 'BBPS' },
  { id: 'failed', label: 'Failed' },
  { id: 'pending', label: 'Pending' },
];

export function TransactionsPage() {
  const { transactions } = useAdminStore();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'failed' || activeTab === 'pending'
          ? t.status === activeTab
          : t.service === activeTab;

      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.utr.toLowerCase().includes(q) ||
        t.retailerName.toLowerCase().includes(q) ||
        t.retailerCode.toLowerCase().includes(q) ||
        t.bankName.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, search]);

  const handleExport = () => {
    exportToCsv(`yenopay-transactions-${activeTab}.csv`, filtered, [
      { key: 'id', header: 'TXN ID' },
      { key: 'utr', header: 'UTR / Reference' },
      { key: 'retailerCode', header: 'Retailer Code' },
      { key: 'retailerName', header: 'Retailer' },
      { key: 'service', header: 'Service' },
      { key: 'subType', header: 'Operation' },
      { key: 'bankName', header: 'Bank / Biller' },
      { key: 'amount', header: 'Amount' },
      { key: 'commission', header: 'Retailer Comm' },
      { key: 'platformRevenue', header: 'Platform Revenue' },
      { key: 'status', header: 'Status' },
      { key: 'createdAt', header: 'Created At' },
    ]);
    notify({
      type: 'success',
      title: 'Export complete',
      message: `Exported ${filtered.length} transactions to CSV.`,
    });
  };

  const columns = [
    {
      key: 'id',
      header: 'TXN ID & UTR',
      sortable: true,
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {t.id}
          </span>
          <p className="font-mono text-[11px] text-slate-500">{t.utr}</p>
        </div>
      ),
    },
    {
      key: 'retailerName',
      header: 'Retailer',
      sortable: true,
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">{t.retailerName}</p>
          <p className="font-mono text-[11px] text-slate-500">{t.retailerCode}</p>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Service & Rail',
      render: (t) => (
        <div>
          <p className="text-xs font-medium text-slate-900">
            {t.service} · {t.subType}
          </p>
          <p className="text-[11px] text-slate-500">
            {t.bankName} · {t.customerRef}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (t) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatINR(t.amount)}
        </span>
      ),
    },
    {
      key: 'platformRevenue',
      header: 'Margin',
      align: 'right',
      sortable: true,
      render: (t) => (
        <span className="font-mono text-xs text-teal-700">
          {formatINR(t.platformRevenue)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (t) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(t.createdAt)}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (t) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTxn(t);
          }}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
          aria-label="Inspect transaction"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Management"
        subtitle="Monitor real-time transaction flows across AEPS, DMT, Cash Deposit, Micro ATM, and BBPS."
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        }
      />

      {/* Segmented Category Filter */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(t) => setSelectedTxn(t)}
        emptyTitle="No transactions in this view"
        emptyDescription="Try switching the service tab or clearing your search query."
        emptyActionLabel="Show All Transactions"
        onEmptyAction={() => {
          setActiveTab('all');
          setSearch('');
        }}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-sm">
              <Input
                icon={Search}
                placeholder="Search TXN ID, UTR, retailer, bank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              {filtered.length} matching records
            </span>
          </div>
        }
      />

      {/* Transaction Detail Modal */}
      <Modal
        open={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        title={selectedTxn ? `Transaction ${selectedTxn.id}` : ''}
        subtitle={selectedTxn ? formatDateTime(selectedTxn.createdAt) : ''}
        size="md"
        footer={
          <Button variant="primary" onClick={() => setSelectedTxn(null)}>
            Close
          </Button>
        }
      >
        {selectedTxn && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <p className="text-xs text-slate-500">Transaction Amount</p>
                <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {formatINR(selectedTxn.amount)}
                </p>
              </div>
              <StatusBadge status={selectedTxn.status} />
            </div>

            {selectedTxn.failureReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                <strong className="font-semibold">Failure Diagnostic: </strong>
                {selectedTxn.failureReason}
              </div>
            )}

            <dl className="grid grid-cols-1 gap-3.5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">UTR / Bank Reference</dt>
                <dd className="mt-0.5 font-mono text-xs font-medium text-slate-900">
                  {selectedTxn.utr}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Service & Operation</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {selectedTxn.service} · {selectedTxn.subType}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Retailer Outlet</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {selectedTxn.retailerName} ({selectedTxn.retailerCode})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Bank / Biller</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {selectedTxn.bankName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Customer Identifier</dt>
                <dd className="mt-0.5 font-mono text-xs text-slate-900">
                  {selectedTxn.customerRef}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Routing Provider</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {selectedTxn.provider}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Retailer Commission</dt>
                <dd className="mt-0.5 font-mono text-xs font-medium text-slate-900">
                  {formatINR(selectedTxn.commission)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Net Platform Revenue</dt>
                <dd className="mt-0.5 font-mono text-xs font-semibold text-teal-700">
                  {formatINR(selectedTxn.platformRevenue)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
