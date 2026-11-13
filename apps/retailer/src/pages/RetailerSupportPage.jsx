import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  DataTable,
  Dropdown,
  Input,
  Modal,
  PageHeader,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import { formatDateTime } from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';

export function RetailerSupportPage() {
  const { tickets, raiseTicket } = useRetailerStore();
  const { notify } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    category: 'Failed Transaction',
    txnRef: '',
    subject: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    const created = raiseTicket(form);
    setModalOpen(false);
    setForm({ category: 'Failed Transaction', txnRef: '', subject: '' });
    notify({
      type: 'success',
      title: 'Support ticket raised',
      message: `Ticket ${created.id} submitted to YenoPay operations.`,
    });
  };

  const columns = [
    {
      key: 'id',
      header: 'Ticket ID',
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {t.id}
          </span>
          <p className="text-[11px] text-slate-500">{t.category}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject & Latest Update',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">{t.subject}</p>
          <p className="text-xs text-slate-500">{t.lastReply}</p>
        </div>
      ),
    },
    {
      key: 'txnRef',
      header: 'Reference',
      render: (t) => (
        <span className="font-mono text-xs text-slate-600">
          {t.txnRef || '—'}
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
      header: 'Raised At',
      render: (t) => (
        <span className="text-xs text-slate-500">{formatDateTime(t.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        subtitle="Raise transaction disputes, settlement queries, or biometric device support tickets."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setModalOpen(true)}
          >
            Raise Ticket
          </Button>
        }
      />

      <DataTable columns={columns} data={tickets} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Raise Support Ticket"
        subtitle="Provide transaction reference and issue summary for faster resolution."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="raise-ticket-form">
              Submit Ticket
            </Button>
          </>
        }
      >
        <form id="raise-ticket-form" onSubmit={handleSubmit} className="space-y-4">
          <Dropdown
            label="Issue Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              'Failed Transaction',
              'Settlement',
              'Wallet Top-up',
              'Commission',
              'KYC & Account',
            ]}
          />
          <Input
            label="Transaction / Settlement Reference (Optional)"
            value={form.txnRef}
            onChange={(e) => setForm({ ...form, txnRef: e.target.value.toUpperCase() })}
            placeholder="e.g. TXN-908351"
          />
          <Input
            label="Issue Summary"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Describe the issue clearly..."
          />
        </form>
      </Modal>
    </div>
  );
}
