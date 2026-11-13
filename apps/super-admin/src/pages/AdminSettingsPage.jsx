import React, { useState } from 'react';
import { Save } from 'lucide-react';
import {
  Button,
  Dropdown,
  Input,
  PageHeader,
  useNotification,
} from '@yenopay/shared-ui';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function AdminSettingsPage() {
  const { settings, saveSettings } = useAdminStore();
  const { notify } = useNotification();
  const [form, setForm] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings({
      ...form,
      minSettlementAmount: Number(form.minSettlementAmount),
      maxDailyAepsPerRetailer: Number(form.maxDailyAepsPerRetailer),
    });
    notify({
      type: 'success',
      title: 'Settings saved',
      message: 'Platform governance and settlement rules updated.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        subtitle="Configure platform operational rules, settlement thresholds, and compliance controls."
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Platform Legal Entity Name"
            value={form.platformName}
            onChange={(e) => setForm({ ...form, platformName: e.target.value })}
          />
          <Input
            label="Operations Support Email"
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
          />
          <Dropdown
            label="Default Settlement Cycle"
            value={form.settlementWindow}
            onChange={(e) => setForm({ ...form, settlementWindow: e.target.value })}
            options={[
              {
                value: 'T+0 Instant (IMPS) / T+1 NEFT',
                label: 'T+0 Instant (IMPS) / T+1 NEFT',
              },
              { value: 'T+1 Daily Batch', label: 'T+1 Daily Batch' },
              { value: 'Manual Approval Only', label: 'Manual Approval Only' },
            ]}
          />
          <Input
            label="Minimum Settlement Request (₹)"
            type="number"
            min="100"
            value={form.minSettlementAmount}
            onChange={(e) =>
              setForm({ ...form, minSettlementAmount: e.target.value })
            }
          />
          <Input
            label="Daily AEPS Limit per Retailer (₹)"
            type="number"
            min="10000"
            value={form.maxDailyAepsPerRetailer}
            onChange={(e) =>
              setForm({ ...form, maxDailyAepsPerRetailer: e.target.value })
            }
          />
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-5">
          <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3.5 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Enforce Two-Factor Authentication for Super Admins
              </p>
              <p className="text-xs text-slate-500">
                Require authenticator verification for wallet adjustments and settlement releases.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.requireTwoFactorAdmin}
              onChange={(e) =>
                setForm({ ...form, requireTwoFactorAdmin: e.target.checked })
              }
              className="mt-1 h-4 w-4 accent-cyan-600"
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3.5 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Auto-Hold Payouts for Incomplete KYC
              </p>
              <p className="text-xs text-slate-500">
                Automatically place settlement requests on review if retailer KYC is pending or rejected.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.autoHoldUnverifiedKyc}
              onChange={(e) =>
                setForm({ ...form, autoHoldUnverifiedKyc: e.target.checked })
              }
              className="mt-1 h-4 w-4 accent-cyan-600"
            />
          </label>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button variant="primary" type="submit" icon={Save}>
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
