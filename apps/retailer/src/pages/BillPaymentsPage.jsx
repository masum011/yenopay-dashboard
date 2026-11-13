import React, { useMemo, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import {
  Button,
  DataTable,
  Dropdown,
  Input,
  PageHeader,
  StatusBadge,
} from '@yenopay/shared-ui';
import {
  formatDateTime,
  formatINR,
  isValidMobile,
  validateAmount,
} from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';
import {
  V1BankingBanner,
  V1PreviewValidationModal,
} from '../components/V1SandboxNotice.jsx';

const TABS = [
  { id: 'bbps', label: 'BBPS Bills' },
  { id: 'mobile', label: 'Mobile Recharge' },
  { id: 'dth', label: 'DTH Recharge' },
  { id: 'utility', label: 'Utility Payments' },
];

export function BillPaymentsPage() {
  const { transactions } = useRetailerStore();
  const [activeTab, setActiveTab] = useState('bbps');

  const [form, setForm] = useState({
    category: 'Electricity',
    biller: 'MSEDCL Maharashtra',
    consumerId: '',
    operator: 'Reliance Jio',
    circle: 'Maharashtra & Goa',
    mobile: '',
    dthOperator: 'Tata Play',
    subscriberId: '',
    amount: '499',
  });
  const [errors, setErrors] = useState({});
  const [previewPayload, setPreviewPayload] = useState(null);

  const billLogs = useMemo(
    () =>
      transactions.filter(
        (t) => t.service === 'BBPS' || t.service === 'Recharge'
      ),
    [transactions]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};

    if (activeTab === 'mobile') {
      if (!isValidMobile(form.mobile)) {
        next.mobile = 'Enter a valid 10-digit mobile number.';
      }
      const amtErr = validateAmount(form.amount, 10, 10000);
      if (amtErr) next.amount = amtErr;
    } else if (activeTab === 'dth') {
      if (!form.subscriberId.trim() || form.subscriberId.trim().length < 6) {
        next.subscriberId = 'Enter a valid DTH Subscriber ID.';
      }
      const amtErr = validateAmount(form.amount, 50, 15000);
      if (amtErr) next.amount = amtErr;
    } else {
      if (!form.consumerId.trim() || form.consumerId.trim().length < 5) {
        next.consumerId = 'Enter a valid Consumer / Account ID.';
      }
      const amtErr = validateAmount(form.amount, 10, 100000);
      if (amtErr) next.amount = amtErr;
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (activeTab === 'mobile') {
      setPreviewPayload({
        Service: 'Mobile Recharge',
        Operator: `${form.operator} (${form.circle})`,
        'Mobile Number': form.mobile,
        'Plan Amount': formatINR(form.amount),
        'Execution Status': 'Validated locally (V1 — Live operator API disabled)',
      });
    } else if (activeTab === 'dth') {
      setPreviewPayload({
        Service: 'DTH Recharge',
        Operator: form.dthOperator,
        'Subscriber ID': form.subscriberId,
        'Recharge Amount': formatINR(form.amount),
        'Execution Status': 'Validated locally (V1 — Live operator API disabled)',
      });
    } else {
      setPreviewPayload({
        Service: activeTab === 'bbps' ? 'BBPS Bill Payment' : 'Utility Payment',
        Category: form.category,
        Biller: form.biller,
        'Consumer Number': form.consumerId,
        'Bill Amount': formatINR(form.amount),
        'Execution Status': 'Validated locally (V1 — Live BBPS switch disabled)',
      });
    }
  };

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
      key: 'subType',
      header: 'Biller & Consumer',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">
            {t.subType} · {t.bankName}
          </p>
          <p className="font-mono text-xs text-slate-500">{t.customerRef}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatINR(t.amount)}
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
      render: (t) => (
        <span className="text-xs text-slate-500">{formatDateTime(t.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill Payments & Recharges"
        subtitle="BBPS electricity, gas, water, broadband, mobile prepaid, and DTH recharge counter."
      />

      <V1BankingBanner serviceName="BBPS & Recharge" />

      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setErrors({});
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        {(activeTab === 'bbps' || activeTab === 'utility') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dropdown
              label="Utility Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                'Electricity',
                'Piped Gas',
                'Water Supply',
                'Broadband Postpaid',
                'FASTag Recharge',
                'LPG Cylinder',
              ]}
            />
            <Dropdown
              label="Biller Name"
              value={form.biller}
              onChange={(e) => setForm({ ...form, biller: e.target.value })}
              options={[
                'MSEDCL Maharashtra',
                'Tata Power Mumbai',
                'DGVCL Gujarat',
                'BESCOM Bengaluru',
                'Mahanagar Gas',
                'ACT Fibernet',
              ]}
            />
            <Input
              label="Consumer / CA Number"
              required
              value={form.consumerId}
              onChange={(e) => setForm({ ...form, consumerId: e.target.value })}
              error={errors.consumerId}
              placeholder="e.g. 170029182441"
            />
            <Input
              label="Bill Amount (₹)"
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              error={errors.amount}
            />
          </div>
        )}

        {activeTab === 'mobile' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Customer Mobile Number"
              required
              maxLength={10}
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              error={errors.mobile}
              placeholder="10-digit mobile"
            />
            <Dropdown
              label="Telecom Operator"
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value })}
              options={['Reliance Jio', 'Bharti Airtel', 'Vi (Vodafone Idea)', 'BSNL']}
            />
            <Dropdown
              label="Circle"
              value={form.circle}
              onChange={(e) => setForm({ ...form, circle: e.target.value })}
              options={[
                'Maharashtra & Goa',
                'Delhi NCR',
                'Karnataka',
                'Gujarat',
                'Rajasthan',
                'Uttar Pradesh (East)',
              ]}
            />
            <Input
              label="Recharge Plan Amount (₹)"
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              error={errors.amount}
            />
          </div>
        )}

        {activeTab === 'dth' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dropdown
              label="DTH Operator"
              value={form.dthOperator}
              onChange={(e) => setForm({ ...form, dthOperator: e.target.value })}
              options={[
                'Tata Play',
                'Airtel Digital TV',
                'Dish TV',
                'Sun Direct',
                'd2h',
              ]}
            />
            <Input
              label="Subscriber / VC Number"
              required
              value={form.subscriberId}
              onChange={(e) => setForm({ ...form, subscriberId: e.target.value })}
              error={errors.subscriberId}
              placeholder="e.g. 1029384712"
            />
            <Input
              label="Recharge Amount (₹)"
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              error={errors.amount}
            />
          </div>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button variant="primary" type="submit" icon={ReceiptText}>
            Validate Payment Payload
          </Button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">
          Recent Bill & Recharge History
        </h2>
        <DataTable columns={columns} data={billLogs} pageSize={5} />
      </div>

      <V1PreviewValidationModal
        previewData={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />
    </div>
  );
}
