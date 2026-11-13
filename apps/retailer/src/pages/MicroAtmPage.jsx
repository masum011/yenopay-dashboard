import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
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

export function MicroAtmPage() {
  const { transactions } = useRetailerStore();
  const [form, setForm] = useState({
    operation: 'Card Withdrawal',
    deviceModel: 'MoreFun MP63 (Bluetooth)',
    mobile: '',
    amount: '2000',
  });
  const [errors, setErrors] = useState({});
  const [previewPayload, setPreviewPayload] = useState(null);

  const matmLogs = transactions.filter((t) => t.service === 'Micro ATM');

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isValidMobile(form.mobile)) {
      next.mobile = 'Enter a valid 10-digit customer mobile number.';
    }
    if (form.operation === 'Card Withdrawal') {
      const amtErr = validateAmount(form.amount, 100, 10000);
      if (amtErr) next.amount = amtErr;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPreviewPayload({
      Service: 'Micro ATM (Card + PIN)',
      Operation: form.operation,
      'Terminal Device': form.deviceModel,
      'Customer Mobile': form.mobile,
      Amount:
        form.operation === 'Card Withdrawal'
          ? formatINR(form.amount)
          : '₹0.00 (Balance Enquiry)',
      'Execution Status': 'Validated locally (V1 — Device SDK & live switch disabled)',
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
      key: 'customerName',
      header: 'Card & Bank',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">{t.customerName}</p>
          <p className="text-xs text-slate-500">
            {t.bankName} · {t.customerRef}
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
        title="Micro ATM"
        subtitle="Accept RuPay, Visa, and Mastercard debit card withdrawals and balance enquiries via POS terminal."
      />

      <V1BankingBanner serviceName="Micro ATM" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"
        >
          <h2 className="font-display text-base font-semibold text-slate-900">
            Card Terminal Interface
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dropdown
              label="Operation Mode"
              value={form.operation}
              onChange={(e) => setForm({ ...form, operation: e.target.value })}
              options={['Card Withdrawal', 'Balance Enquiry']}
            />
            <Dropdown
              label="Paired Micro ATM Device"
              value={form.deviceModel}
              onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
              options={[
                'MoreFun MP63 (Bluetooth)',
                'Pax D180 PIN Pad',
                'Wiseasy N3 Mini',
              ]}
            />
            <Input
              label="Customer Mobile Number"
              required
              maxLength={10}
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              error={errors.mobile}
            />
            {form.operation === 'Card Withdrawal' && (
              <Input
                label="Withdrawal Amount (₹100 – ₹10,000)"
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                error={errors.amount}
              />
            )}
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button variant="primary" type="submit" icon={CreditCard}>
              Validate Micro ATM Request
            </Button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-semibold text-slate-900">
            Terminal Checklist
          </h3>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
            <li>Ensure Bluetooth pairing is active on the outlet device.</li>
            <li>Keep EMV chip card inserted until PIN entry completes.</li>
            <li>Daily card withdrawal cap follows issuer bank ATM limits.</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">
          Recent Micro ATM Logs
        </h2>
        <DataTable columns={columns} data={matmLogs} pageSize={5} />
      </div>

      <V1PreviewValidationModal
        previewData={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />
    </div>
  );
}
