import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
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
  isValidAadhaar,
  isValidMobile,
  validateAmount,
} from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';
import { INDIAN_BANKS } from '../services/mockRetailerData.js';
import {
  V1BankingBanner,
  V1PreviewValidationModal,
} from '../components/V1SandboxNotice.jsx';

const AMOUNT_PRESETS = [500, 1000, 2000, 3000, 5000, 10000];

export function AepsPage() {
  const { transactions } = useRetailerStore();
  const [mode, setMode] = useState('withdrawal');
  const [form, setForm] = useState({
    aadhaar: '',
    mobile: '',
    bankName: INDIAN_BANKS[0],
    device: 'Mantra MFS100 (USB)',
    amount: '2000',
  });
  const [errors, setErrors] = useState({});
  const [previewPayload, setPreviewPayload] = useState(null);

  const aepsLogs = transactions.filter((t) => t.service === 'AEPS');

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isValidAadhaar(form.aadhaar)) {
      next.aadhaar = 'Enter a valid 12-digit Aadhaar number.';
    }
    if (!isValidMobile(form.mobile)) {
      next.mobile = 'Enter a valid 10-digit customer mobile number.';
    }
    if (mode === 'withdrawal') {
      const amtErr = validateAmount(form.amount, 100, 10000);
      if (amtErr) next.amount = amtErr;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const cleanAadhaar = form.aadhaar.replace(/\D/g, '');
    setPreviewPayload({
      Service: 'AEPS (Aadhaar Enabled Payment System)',
      Operation:
        mode === 'withdrawal'
          ? 'Cash Withdrawal'
          : mode === 'balance'
          ? 'Balance Enquiry'
          : 'Mini Statement',
      'Customer Aadhaar': `XXXX XXXX ${cleanAadhaar.slice(-4)}`,
      'Customer Mobile': form.mobile,
      Bank: form.bankName,
      'Biometric Scanner': form.device,
      Amount: mode === 'withdrawal' ? formatINR(form.amount) : '₹0.00 (Enquiry)',
      'Execution Status': 'Validated locally (V1 — Live NPCI disabled)',
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
      key: 'subType',
      header: 'Operation',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">{t.subType}</p>
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
        title="AEPS Banking Services"
        subtitle="Aadhaar biometric cash withdrawal, balance enquiry, and mini statement."
      />

      <V1BankingBanner serviceName="AEPS" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          {/* Operation Mode Tabs */}
          <div className="mb-6 inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1">
            {[
              { id: 'withdrawal', label: 'Cash Withdrawal' },
              { id: 'balance', label: 'Balance Enquiry' },
              { id: 'ministatement', label: 'Mini Statement' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id);
                  setErrors({});
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  mode === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Customer Aadhaar Number"
                required
                maxLength={14}
                value={form.aadhaar}
                onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
                error={errors.aadhaar}
                placeholder="12-digit Aadhaar number"
              />
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
                label="Customer Bank"
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                options={INDIAN_BANKS}
              />
              <Dropdown
                label="RD Biometric Device"
                required
                value={form.device}
                onChange={(e) => setForm({ ...form, device: e.target.value })}
                options={[
                  'Mantra MFS100 (USB)',
                  'Morpho MSO 1300 E3',
                  'Startek FM220U',
                  'Precision PB510',
                ]}
              />
            </div>

            {mode === 'withdrawal' && (
              <div className="space-y-2.5 pt-1">
                <Input
                  label="Withdrawal Amount (₹100 – ₹10,000)"
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  error={errors.amount}
                />
                <div className="flex flex-wrap gap-2">
                  {AMOUNT_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setForm({ ...form, amount: String(amt) })}
                      className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer ${
                        Number(form.amount) === amt
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setForm({
                    aadhaar: '',
                    mobile: '',
                    bankName: INDIAN_BANKS[0],
                    device: 'Mantra MFS100 (USB)',
                    amount: '2000',
                  });
                  setErrors({});
                }}
              >
                Clear
              </Button>
              <Button variant="primary" type="submit" icon={Fingerprint}>
                Validate AEPS Request
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              AEPS Operational Guidelines
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
              <li>Single transaction limit: ₹100 to ₹10,000 per Aadhaar authentication.</li>
              <li>Ensure customer consent before initiating biometric capture.</li>
              <li>Two-factor agent authentication is enforced once daily in production.</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">
          Recent AEPS Records
        </h2>
        <DataTable columns={columns} data={aepsLogs} pageSize={5} />
      </div>

      <V1PreviewValidationModal
        previewData={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />
    </div>
  );
}
