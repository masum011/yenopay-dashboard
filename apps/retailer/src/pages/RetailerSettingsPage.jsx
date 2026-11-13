import React, { useState } from 'react';
import { Save } from 'lucide-react';
import {
  Button,
  Dropdown,
  Input,
  PageHeader,
  useNotification,
} from '@yenopay/shared-ui';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';

export function RetailerSettingsPage() {
  const { settings, setSettings } = useRetailerStore();
  const { notify } = useNotification();
  const [form, setForm] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings({
      ...form,
      lowBalanceThreshold: Number(form.lowBalanceThreshold),
    });
    notify({
      type: 'success',
      title: 'Preferences saved',
      message: 'Outlet printing and security settings updated.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure receipt print preferences, TPIN confirmation rules, and low-balance alerts."
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Dropdown
            label="Default Receipt Print Format"
            value={form.receiptFormat}
            onChange={(e) => setForm({ ...form, receiptFormat: e.target.value })}
            options={[
              { value: 'thermal_80mm', label: 'Thermal 80mm POS' },
              { value: 'thermal_58mm', label: 'Thermal 58mm Compact' },
              { value: 'a4_standard', label: 'A4 Standard Invoice' },
            ]}
          />
          <Input
            label="Low Wallet Alert Threshold (₹)"
            type="number"
            min="1000"
            value={form.lowBalanceThreshold}
            onChange={(e) =>
              setForm({ ...form, lowBalanceThreshold: e.target.value })
            }
          />
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-5">
          <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3.5 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Require Transaction PIN for Money Transfers
              </p>
              <p className="text-xs text-slate-500">
                Prompt for 4-digit outlet TPIN before confirming DMT transfers.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.requireTpinForDmt}
              onChange={(e) =>
                setForm({ ...form, requireTpinForDmt: e.target.checked })
              }
              className="mt-1 h-4 w-4 accent-cyan-600"
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3.5 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-900">
                SMS Receipt Confirmation to Customer
              </p>
              <p className="text-xs text-slate-500">
                Send automated transaction status SMS after successful settlements.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.smsReceipts}
              onChange={(e) =>
                setForm({ ...form, smsReceipts: e.target.checked })
              }
              className="mt-1 h-4 w-4 accent-cyan-600"
            />
          </label>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button variant="primary" type="submit" icon={Save}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
