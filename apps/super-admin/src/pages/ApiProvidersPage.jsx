import React, { useState } from 'react';
import { ServerCog, ShieldAlert } from 'lucide-react';
import {
  Button,
  Dropdown,
  Input,
  Modal,
  PageHeader,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function ApiProvidersPage() {
  const { apiProviders, updateApiProvider } = useAdminStore();
  const { notify } = useNotification();

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    endpoint: '',
    priority: 'Primary',
    timeoutMs: '12000',
    active: true,
  });

  const openEdit = (provider) => {
    setEditing(provider);
    setForm({
      endpoint: provider.endpoint,
      priority: provider.priority,
      timeoutMs: String(provider.timeoutMs),
      active: provider.active,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editing) return;
    updateApiProvider(editing.id, {
      endpoint: form.endpoint.trim(),
      priority: form.priority,
      timeoutMs: Number(form.timeoutMs) || 10000,
      active: form.active,
    });
    notify({
      type: 'success',
      title: 'Provider configuration updated',
      message: `${editing.name} routing rules saved for server-side proxy.`,
    });
    setEditing(null);
  };

  const toggleProvider = (provider) => {
    updateApiProvider(provider.id, { active: !provider.active });
    notify({
      type: 'info',
      title: provider.active ? 'Provider disabled' : 'Provider enabled',
      message: `${provider.name} routing state updated.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banking API Providers"
        subtitle="Manage server-side banking rail routing, timeouts, and failover priorities."
      />

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
        <ShieldAlert className="h-4 w-4 shrink-0 text-cyan-700 mt-0.5" />
        <p>
          <strong className="font-semibold text-slate-900">Security Architecture:</strong>{' '}
          Provider API keys and signing certificates remain encrypted in server-side Edge Function secrets. Frontend administration displays masked identifiers only and executes no direct banking calls in V1.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {apiProviders.map((provider) => (
          <div
            key={provider.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <ServerCog className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {provider.service} · {provider.priority} Route
                    </p>
                  </div>
                </div>
                <StatusBadge status={provider.active ? 'active' : 'inactive'} />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                <div className="col-span-2">
                  <dt className="text-slate-500">Proxy Endpoint</dt>
                  <dd className="mt-0.5 truncate font-mono text-slate-800">
                    {provider.endpoint}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Merchant ID</dt>
                  <dd className="mt-0.5 font-mono text-slate-900">
                    {provider.merchantId}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Credential Key</dt>
                  <dd className="mt-0.5 font-mono text-slate-600">
                    {provider.secretMasked}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Timeout SLA</dt>
                  <dd className="mt-0.5 font-mono text-slate-900 tabular-nums">
                    {provider.timeoutMs} ms
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">30D Health Rate</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-teal-700 tabular-nums">
                    {provider.successRate}%
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleProvider(provider)}
              >
                {provider.active ? 'Disable Route' : 'Enable Route'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openEdit(provider)}
              >
                Configure
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Configure ${editing.name}` : ''}
        subtitle="Update routing priority and proxy timeout parameters."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="api-provider-form">
              Save Routing
            </Button>
          </>
        }
      >
        <form id="api-provider-form" onSubmit={handleSave} className="space-y-4">
          <Input
            label="Internal Proxy Endpoint"
            required
            value={form.endpoint}
            onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
          />
          <Dropdown
            label="Routing Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[
              { value: 'Primary', label: 'Primary' },
              { value: 'Failover', label: 'Failover' },
              { value: 'Standby', label: 'Standby' },
            ]}
          />
          <Input
            label="Timeout (ms)"
            type="number"
            min="3000"
            max="30000"
            required
            value={form.timeoutMs}
            onChange={(e) => setForm({ ...form, timeoutMs: e.target.value })}
          />
          <Dropdown
            label="Status"
            value={form.active ? 'active' : 'inactive'}
            onChange={(e) =>
              setForm({ ...form, active: e.target.value === 'active' })
            }
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
