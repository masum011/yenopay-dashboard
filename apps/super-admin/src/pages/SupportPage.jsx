import React, { useMemo, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
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
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function SupportPage() {
  const { supportTickets, updateSupportTicket } = useAdminStore();
  const { notify } = useNotification();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTicket, setActiveTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [nextStatus, setNextStatus] = useState('in_progress');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return supportTickets.filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.retailerName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.txnRef.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [supportTickets, search, statusFilter]);

  const openTicket = (ticket) => {
    setActiveTicket(ticket);
    setResolutionNote(ticket.lastNote || '');
    setNextStatus(ticket.status);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    updateSupportTicket(activeTicket.id, {
      status: nextStatus,
      lastNote: resolutionNote.trim(),
    });
    notify({
      type: 'success',
      title: 'Ticket updated',
      message: `${activeTicket.id} marked as ${nextStatus.replace('_', ' ')}.`,
    });
    setActiveTicket(null);
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
      key: 'retailerName',
      header: 'Retailer & Subject',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">{t.subject}</p>
          <p className="text-xs text-slate-500">
            {t.retailerName} ({t.retailerCode})
            {t.txnRef ? ` · Ref: ${t.txnRef}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => (
        <span
          className={`text-xs font-semibold capitalize ${
            t.priority === 'high'
              ? 'text-red-600'
              : t.priority === 'medium'
              ? 'text-amber-700'
              : 'text-slate-600'
          }`}
        >
          {t.priority}
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
      header: 'Raised',
      render: (t) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(t.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (t) => (
        <Button
          variant="secondary"
          size="sm"
          icon={MessageSquare}
          onClick={(e) => {
            e.stopPropagation();
            openTicket(t);
          }}
        >
          Respond
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Complaints"
        subtitle="Manage retailer escalations, disputed transactions, KYC reviews, and settlement queries."
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(t) => openTicket(t)}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                icon={Search}
                placeholder="Search ticket ID, retailer, TXN ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-44">
              <Dropdown
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Tickets' },
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                ]}
              />
            </div>
          </div>
        }
      />

      <Modal
        open={Boolean(activeTicket)}
        onClose={() => setActiveTicket(null)}
        title={activeTicket ? `${activeTicket.id} — ${activeTicket.category}` : ''}
        subtitle={
          activeTicket
            ? `${activeTicket.retailerName} (${activeTicket.retailerCode})`
            : ''
        }
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setActiveTicket(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="ticket-reply-form">
              Update Ticket
            </Button>
          </>
        }
      >
        {activeTicket && (
          <form id="ticket-reply-form" onSubmit={handleUpdate} className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-800">
              {activeTicket.subject}
              {activeTicket.txnRef && (
                <p className="mt-1 font-mono text-xs text-slate-500">
                  Linked Reference: {activeTicket.txnRef}
                </p>
              )}
            </div>

            <Dropdown
              label="Ticket Status"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
              ]}
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Resolution / Operations Note
              </label>
              <textarea
                rows={4}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Enter investigation note or reply for the retailer..."
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
