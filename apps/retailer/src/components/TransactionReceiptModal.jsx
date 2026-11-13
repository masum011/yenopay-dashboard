import React from 'react';
import { Download, Printer } from 'lucide-react';
import { Button, Modal, StatusBadge, BrandLogo } from '@yenopay/shared-ui';
import { formatDateTime, formatINR } from '@yenopay/shared-utils';

export function TransactionReceiptModal({ transaction, profile, onClose }) {
  const handleDownloadReceipt = () => {
    if (!transaction) return;
    const lines = [
      'YENOPAY TRANSACTION RECEIPT',
      '========================================',
      `Outlet:       ${profile?.outletName || 'YenoPay Retailer'} (${profile?.code || ''})`,
      `Transaction:  ${transaction.id}`,
      `UTR / Ref:    ${transaction.utr}`,
      `Date & Time:  ${formatDateTime(transaction.createdAt)}`,
      `Service:      ${transaction.service} (${transaction.subType})`,
      `Bank/Biller:  ${transaction.bankName}`,
      `Customer Ref: ${transaction.customerRef}`,
      `Amount:       ${formatINR(transaction.amount)}`,
      `Fee:          ${formatINR(transaction.fee || 0)}`,
      `Status:       ${String(transaction.status).toUpperCase()}`,
      '========================================',
      'Customer Copy · Generated via YenoPay Retailer Portal',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transaction.id}-receipt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={Boolean(transaction)}
      onClose={onClose}
      title="Transaction Receipt"
      subtitle={transaction ? `${transaction.id} · ${transaction.service}` : ''}
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleDownloadReceipt}
          >
            Download Receipt
          </Button>
          <Button
            variant="primary"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Receipt
          </Button>
        </>
      }
    >
      {transaction && (
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between border-b border-dashed border-slate-200 pb-4">
            <BrandLogo variant="light" portalLabel={profile?.outletName} />
            <StatusBadge status={transaction.status} />
          </div>

          <div className="text-center py-2">
            <p className="text-xs text-slate-500">Transaction Amount</p>
            <p className="mt-1 font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {formatINR(transaction.amount)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDateTime(transaction.createdAt)}
            </p>
          </div>

          <dl className="divide-y divide-slate-100 border-t border-b border-slate-200 text-xs">
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">Transaction ID</dt>
              <dd className="font-mono font-semibold text-slate-900">
                {transaction.id}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">UTR / Bank Ref</dt>
              <dd className="font-mono text-slate-900">{transaction.utr}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">Service</dt>
              <dd className="font-medium text-slate-900">
                {transaction.service} · {transaction.subType}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">Bank / Biller</dt>
              <dd className="font-medium text-slate-900">{transaction.bankName}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">Customer / Account</dt>
              <dd className="font-mono text-slate-900">{transaction.customerRef}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">Convenience Fee</dt>
              <dd className="font-mono text-slate-900">
                {formatINR(transaction.fee || 0)}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">Retailer Code</dt>
              <dd className="font-mono text-slate-900">{profile?.code}</dd>
            </div>
          </dl>

          <p className="text-center text-[11px] text-slate-400">
            This is a system-generated receipt from {profile?.outletName}.
          </p>
        </div>
      )}
    </Modal>
  );
}
