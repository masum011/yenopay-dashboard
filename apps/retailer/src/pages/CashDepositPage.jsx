import React, { useState } from 'react';
import { Banknote } from 'lucide-react';
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
  isValidAccountNumber,
  isValidMobile,
  validateAmount,
} from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';
import { SUPPORTED_CASH_DEPOSIT_BANKS } from '../services/mockRetailerData.js';
import {
  V1BankingBanner,
  V1PreviewValidationModal,
} from '../components/V1SandboxNotice.jsx';

export function CashDepositPage() {
  const { transactions } = useRetailerStore();
  const [form, setForm] = useState({
    bankName: SUPPORTED_CASH_DEPOSIT_BANKS[0].bank,
    accountOrAadhaar: '',
    mobile: '',
    amount: '2500',
  });
  const [errors, setErrors] = useState({});
  const [previewPayload, setPreviewPayload] = useState(null);

  const depositLogs = transactions.filter((t) => t.service === 'Cash Deposit');

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isValidAccountNumber(form.accountOrAadhaar)) {
      next.accountOrAadhaar = 'Enter a valid 9–18 digit account or 12-digit Aadhaar.';
    }
    if (!isValidMobile(form.mobile)) {
      next.mobile = 'Enter a valid 10-digit customer mobile.';
    }
    const amtErr = validateAmount(form.amount, 100, 50000);
    if (amtErr) next.amount = amtErr;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPreviewPayload({
      Service: 'Supported Bank Cash Deposit',
      'Partner Bank': form.bankName,
      'Customer Identifier': `••••${form.accountOrAadhaar.slice(-4)}`,
      'Customer Mobile': form.mobile,
      Amount: formatINR(form.amount),
      'Execution Status': 'Validated locally (V1 — Live cash deposit disabled)',
    });
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
      key: 'bankName',
      header: 'Bank & Customer',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">{t.bankName}</p>
          <p className="text-xs text-slate-500">
            {t.customerName} · {t.customerRef}
          </p>
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
        title="Cash Deposit"
        subtitle="Accept over-the-counter cash deposits exclusively for provider-supported partner banks."
      />

      <V1BankingBanner serviceName="Cash Deposit" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"
        >
          <h2 className="font-display text-base font-semibold text-slate-900">
            Cash Deposit Counter
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dropdown
              label="Supported Partner Bank"
              required
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              options={SUPPORTED_CASH_DEPOSIT_BANKS.map((b) => b.bank)}
            />
            <Input
              label="Account / Aadhaar Number"
              required
              value={form.accountOrAadhaar}
              onChange={(e) =>
                setForm({ ...form, accountOrAadhaar: e.target.value })
              }
              error={errors.accountOrAadhaar}
            />
            <Input
              label="Customer Mobile Number"
              required
              maxLength={10}
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              error={errors.mobile}
            />
            <Input
              label="Deposit Amount (₹100 – ₹50,000)"
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              error={errors.amount}
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button variant="primary" type="submit" icon={Banknote}>
              Validate Deposit Request
            </Button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-semibold text-slate-900">
            Provider-Supported Banks
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Cash deposit is enabled strictly for banks supported by the active banking partner.
          </p>
          <div className="mt-4 divide-y divide-slate-100">
            {SUPPORTED_CASH_DEPOSIT_BANKS.map((item) => (
              <div key={item.bank} className="py-2.5 text-xs">
                <p className="font-semibold text-slate-900">{item.bank}</p>
                <p className="mt-0.5 text-slate-500">
                  {item.limit} · {item.mode}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">
          Recent Cash Deposits
        </h2>
        <DataTable columns={columns} data={depositLogs} pageSize={5} />
      </div>

      <V1PreviewValidationModal
        previewData={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />
    </div>
  );
}
