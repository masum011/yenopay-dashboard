import React from 'react';
import { Info } from 'lucide-react';
import { Button, Modal } from '@yenopay/shared-ui';

export function V1BankingBanner({ serviceName }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50/50 px-4 py-3 text-xs text-slate-700">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
      <p>
        <strong className="font-semibold text-slate-900">V1 UI Milestone:</strong>{' '}
        {serviceName} form validation and workflow previews are active. Live NPCI / banking provider execution and real wallet debits are intentionally disabled until backend proxy integration.
      </p>
    </div>
  );
}

export function V1PreviewValidationModal({ previewData, onClose }) {
  return (
    <Modal
      open={Boolean(previewData)}
      onClose={onClose}
      title="V1 Request Validation Summary"
      subtitle="Input payload verified locally — live banking execution disabled in V1."
      size="md"
      footer={
        <Button variant="primary" onClick={onClose}>
          Acknowledge
        </Button>
      }
    >
      {previewData && (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
            No real financial transaction was executed or simulated as settled. When connected to the Supabase Edge Function banking proxy, this validated payload will route to the configured provider.
          </div>

          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-4 text-xs">
            {Object.entries(previewData).map(([label, val]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-mono font-medium text-slate-900 text-right">
                  {String(val)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Modal>
  );
}
