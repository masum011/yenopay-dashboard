import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import {
  Button,
  DataTable,
  Input,
  PageHeader,
  useNotification,
} from '@yenopay/shared-ui';
import { exportToCsv, formatDateTime } from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function AuditLogsPage() {
  const { auditLogs } = useAdminStore();
  const { notify } = useNotification();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter(
      (log) =>
        !q ||
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q)
    );
  }, [auditLogs, search]);

  const handleExport = () => {
    exportToCsv('yenopay-audit-logs.csv', filtered);
    notify({
      type: 'success',
      title: 'Audit log exported',
      message: `Downloaded ${filtered.length} audit entries.`,
    });
  };

  const columns = [
    {
      key: 'id',
      header: 'Log ID',
      render: (l) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {l.id}
        </span>
      ),
    },
    {
      key: 'actorName',
      header: 'Actor',
      render: (l) => (
        <div>
          <p className="font-medium text-slate-900">{l.actorName}</p>
          <p className="text-xs text-slate-500">{l.actorRole}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Event Action',
      render: (l) => <span className="text-slate-800">{l.action}</span>,
    },
    {
      key: 'resource',
      header: 'Target Resource',
      render: (l) => (
        <span className="font-mono text-xs text-slate-600">{l.resource}</span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (l) => (
        <span className="font-mono text-xs text-slate-500">{l.ipAddress}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (l) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(l.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable administrative trail of retailer approvals, wallet adjustments, commission changes, and policy updates."
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export Logs
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        toolbar={
          <div className="w-full sm:max-w-sm">
            <Input
              icon={Search}
              placeholder="Search actor, action, resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />
    </div>
  );
}
