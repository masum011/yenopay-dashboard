import React, { useMemo, useState } from 'react';
import { Download, Eye, Receipt, Search } from 'lucide-react';
import {
  Button,
  DataTable,
  Dropdown,
  Input,
  Modal,
  PageHeader,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import { exportToCsv, formatDateTime, formatINR } from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';
import { TransactionReceiptModal } from '../components/TransactionReceiptModal.jsx';

export function RetailerTransactionsPage() {
  const { transactions, profile } = useRetailerStore();
  const { notify } = useNotification();

  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailTxn, setDetailTxn] = useState(null);
  const [receiptTxn, setReceiptTxn] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesService =
        serviceFilter === 'all' || t.service === serviceFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.utr.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.bankName.toLowerCase().includes(q);
      return matchesService && matchesStatus && matchesSearch;
    });
  }, [transactions, search, serviceFilter, statusFilter]);

  const handleExport = () => {
    exportToCsv('yenopay-retailer-transactions.csv', filtered);
    notify({
      type: 'success',
      title: 'Statement exported',
      message: `Downloaded ${filtered.length} transaction records.`,
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
      key: 'service',
      header: 'Service & Customer',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">
            {t.service} · {t.subType}
          </p>
          <p className="text-xs text-slate-500">
            {t.customerName} · {t.bankName}
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
      key: 'commission',
      header: 'Commission',
      align: 'right',
      render: (t) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {formatINR(t.commission)}
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
      key: 'actions',
      header: '',
      align: 'right',
      render: (t) => (
        <div
          className="inline-flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setDetailTxn(t)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <Button
            variant="secondary"
            size="sm"
            icon={Receipt}
            onClick={() => setReceiptTxn(t)}
          >
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Management"
        subtitle="Search transactions, filter by banking service or status, and print customer receipts."
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(t) => setDetailTxn(t)}
        emptyTitle="No transactions found"
        emptyDescription="Try clearing your search or selecting another service filter."
        emptyActionLabel="Reset Filters"
        onEmptyAction={() => {
          setSearch('');
          setServiceFilter('all');
          setStatusFilter('all');
        }}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                icon={Search}
                placeholder="Search TXN ID, UTR, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-40">
                <Dropdown
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Services' },
                    { value: 'AEPS', label: 'AEPS' },
                    { value: 'DMT', label: 'Money Transfer' },
                    { value: 'BBPS', label: 'BBPS' },
                    { value: 'Micro ATM', label: 'Micro ATM' },
                    { value: 'Cash Deposit', label: 'Cash Deposit' },
                    { value: 'Recharge', label: 'Recharge' },
                  ]}
                />
              </div>
              <div className="w-36">
                <Dropdown
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'success', label: 'Success' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'failed', label: 'Failed' },
                  ]}
                />
              </div>
            </div>
          </div>
        }
      />

      <Modal
        open={Boolean(detailTxn)}
        onClose={() => setDetailTxn(null)}
        title={detailTxn ? `Transaction ${detailTxn.id}` : ''}
        subtitle={detailTxn ? formatDateTime(detailTxn.createdAt) : ''}
        size="md"
        footer={
          detailTxn && (
            <>
              <Button
                variant="secondary"
                icon={Receipt}
                onClick={() => {
                  const target = detailTxn;
                  setDetailTxn(null);
                  setReceiptTxn(target);
                }}
              >
                Open Receipt
              </Button>
              <Button variant="primary" onClick={() => setDetailTxn(null)}>
                Close
              </Button>
            </>
          )
        }
      >
        {detailTxn && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <p className="text-xs text-slate-500">Transaction Amount</p>
                <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {formatINR(detailTxn.amount)}
                </p>
              </div>
              <StatusBadge status={detailTxn.status} />
            </div>

            {detailTxn.failureReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                <strong>Failure Note: </strong>
                {detailTxn.failureReason}
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-500">UTR / Ref</dt>
                <dd className="mt-0.5 font-mono font-medium text-slate-900">
                  {detailTxn.utr}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Service</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {detailTxn.service} · {detailTxn.subType}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Customer</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {detailTxn.customerName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Bank / Biller</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {detailTxn.bankName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Customer Identifier</dt>
                <dd className="mt-0.5 font-mono text-slate-900">
                  {detailTxn.customerRef}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Commission Earned</dt>
                <dd className="mt-0.5 font-mono font-semibold text-teal-700">
                  {formatINR(detailTxn.commission)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      <TransactionReceiptModal
        transaction={receiptTxn}
        profile={profile}
        onClose={() => setReceiptTxn(null)}
      />
    </div>
  );
}
