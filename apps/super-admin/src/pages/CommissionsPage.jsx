import React, { useMemo, useState } from 'react';
import { Download, Edit3, Percent } from 'lucide-react';
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
import { exportToCsv, formatDateTime, formatINR } from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function CommissionsPage() {
  const { commissionSlabs, transactions, retailers, updateCommissionSlab } =
    useAdminStore();
  const { notify } = useNotification();

  const [tab, setTab] = useState('slabs');
  const [editingSlab, setEditingSlab] = useState(null);
  const [slabForm, setSlabForm] = useState({
    retailerRate: '',
    distributorRate: '',
    platformMargin: '',
    active: true,
  });

  const totalRetailerCommission = useMemo(
    () =>
      transactions
        .filter((t) => t.status === 'success')
        .reduce((acc, t) => acc + t.commission, 0),
    [transactions]
  );

  const openEditSlab = (slab) => {
    setEditingSlab(slab);
    setSlabForm({
      retailerRate: String(slab.retailerRate),
      distributorRate: String(slab.distributorRate),
      platformMargin: String(slab.platformMargin),
      active: slab.active,
    });
  };

  const handleSaveSlab = (e) => {
    e.preventDefault();
    if (!editingSlab) return;
    updateCommissionSlab(editingSlab.id, {
      retailerRate: Number(slabForm.retailerRate),
      distributorRate: Number(slabForm.distributorRate),
      platformMargin: Number(slabForm.platformMargin),
      active: slabForm.active,
    });
    notify({
      type: 'success',
      title: 'Commission slab updated',
      message: `${editingSlab.slabName} pricing saved.`,
    });
    setEditingSlab(null);
  };

  const handleExportReport = () => {
    exportToCsv('yenopay-commission-slabs.csv', commissionSlabs);
    notify({
      type: 'success',
      title: 'Commission report exported',
      message: 'Downloaded service-wise commission configuration CSV.',
    });
  };

  const slabColumns = [
    {
      key: 'service',
      header: 'Service & Slab',
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900">{s.slabName}</p>
          <p className="text-xs text-slate-500">
            {s.service} · {formatINR(s.minAmount, { decimals: 0 })} –{' '}
            {formatINR(s.maxAmount, { decimals: 0 })}
          </p>
        </div>
      ),
    },
    {
      key: 'rateType',
      header: 'Model',
      render: (s) => (
        <span className="text-xs font-medium capitalize text-slate-700">
          {s.rateType}
        </span>
      ),
    },
    {
      key: 'retailerRate',
      header: 'Retailer',
      align: 'right',
      render: (s) => (
        <span className="font-mono font-semibold text-slate-900">
          {s.rateType === 'flat' ? formatINR(s.retailerRate) : `${s.retailerRate}%`}
        </span>
      ),
    },
    {
      key: 'distributorRate',
      header: 'Distributor',
      align: 'right',
      render: (s) => (
        <span className="font-mono text-slate-700">
          {s.rateType === 'flat'
            ? formatINR(s.distributorRate)
            : `${s.distributorRate}%`}
        </span>
      ),
    },
    {
      key: 'platformMargin',
      header: 'Platform Margin',
      align: 'right',
      render: (s) => (
        <span className="font-mono font-medium text-teal-700">
          {s.rateType === 'flat'
            ? formatINR(s.platformMargin)
            : `${s.platformMargin}%`}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'State',
      render: (s) => <StatusBadge status={s.active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Edit3}
          onClick={() => openEditSlab(s)}
        >
          Configure
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      key: 'id',
      header: 'Transaction',
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {t.id}
          </span>
          <p className="text-xs text-slate-500">{t.service}</p>
        </div>
      ),
    },
    {
      key: 'retailerName',
      header: 'Retailer',
      render: (t) => (
        <span className="font-medium text-slate-900">{t.retailerName}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Txn Volume',
      align: 'right',
      render: (t) => (
        <span className="font-mono text-slate-700">{formatINR(t.amount)}</span>
      ),
    },
    {
      key: 'commission',
      header: 'Retailer Payout',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-semibold text-emerald-700">
          {formatINR(t.commission)}
        </span>
      ),
    },
    {
      key: 'platformRevenue',
      header: 'Platform Share',
      align: 'right',
      render: (t) => (
        <span className="font-mono text-slate-900">
          {formatINR(t.platformRevenue)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Credited At',
      render: (t) => (
        <span className="text-xs text-slate-500">
          {formatDateTime(t.createdAt)}
        </span>
      ),
    },
  ];

  const retailerTierColumns = [
    {
      key: 'code',
      header: 'Retailer',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {r.code}
          </span>
          <p className="text-xs text-slate-600">{r.outletName}</p>
        </div>
      ),
    },
    {
      key: 'commissionPlan',
      header: 'Assigned Plan',
      render: (r) => (
        <span className="font-medium text-slate-900">{r.commissionPlan}</span>
      ),
    },
    {
      key: 'monthlyVolume',
      header: '30D Volume',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-slate-800">
          {formatINR(r.monthlyVolume, { compact: true })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Management"
        subtitle="Configure service-wise payout slabs, retailer commission tiers, and commission ledger reports."
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportReport}>
            Export Commission Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Configured Service Slabs"
          value={String(commissionSlabs.length)}
          subtext="AEPS, DMT, BBPS, Cash, MATM"
          icon={Percent}
          accent="cyan"
        />
        <StatCard
          title="Disbursed Retailer Commission"
          value={formatINR(totalRetailerCommission)}
          subtext="From cleared sample transactions"
          accent="teal"
        />
        <StatCard
          title="Active Commission Plans"
          value="3 Tiers"
          subtext="Standard, Gold, Platinum"
          accent="navy"
        />
      </div>

      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {[
          { id: 'slabs', label: 'Service Slabs' },
          { id: 'retailers', label: 'Retailer Plans' },
          { id: 'history', label: 'Commission History' },
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

      {tab === 'slabs' && <DataTable columns={slabColumns} data={commissionSlabs} />}
      {tab === 'retailers' && (
        <DataTable columns={retailerTierColumns} data={retailers} />
      )}
      {tab === 'history' && (
        <DataTable
          columns={historyColumns}
          data={transactions.filter((t) => t.status === 'success')}
        />
      )}

      <Modal
        open={Boolean(editingSlab)}
        onClose={() => setEditingSlab(null)}
        title="Configure Commission Slab"
        subtitle={editingSlab ? editingSlab.slabName : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingSlab(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="slab-edit-form">
              Save Slab
            </Button>
          </>
        }
      >
        {editingSlab && (
          <form id="slab-edit-form" onSubmit={handleSaveSlab} className="space-y-4">
            <Input
              label={`Retailer Rate (${
                editingSlab.rateType === 'flat' ? '₹ Flat' : '% Percentage'
              })`}
              type="number"
              step="0.01"
              required
              value={slabForm.retailerRate}
              onChange={(e) =>
                setSlabForm({ ...slabForm, retailerRate: e.target.value })
              }
            />
            <Input
              label={`Distributor Override (${
                editingSlab.rateType === 'flat' ? '₹ Flat' : '% Percentage'
              })`}
              type="number"
              step="0.01"
              required
              value={slabForm.distributorRate}
              onChange={(e) =>
                setSlabForm({ ...slabForm, distributorRate: e.target.value })
              }
            />
            <Input
              label={`Platform Margin (${
                editingSlab.rateType === 'flat' ? '₹ Flat' : '% Percentage'
              })`}
              type="number"
              step="0.01"
              required
              value={slabForm.platformMargin}
              onChange={(e) =>
                setSlabForm({ ...slabForm, platformMargin: e.target.value })
              }
            />
            <Dropdown
              label="Slab Status"
              value={slabForm.active ? 'active' : 'inactive'}
              onChange={(e) =>
                setSlabForm({ ...slabForm, active: e.target.value === 'active' })
              }
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </form>
        )}
      </Modal>
    </div>
  );
}
