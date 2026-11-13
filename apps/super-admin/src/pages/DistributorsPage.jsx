import React, { useMemo, useState } from 'react';
import { Eye, Search, Users } from 'lucide-react';
import {
  Button,
  DataTable,
  Input,
  Modal,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@yenopay/shared-ui';
import { formatDate, formatINR, formatNumber } from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

export function DistributorsPage() {
  const { distributors, retailers } = useAdminStore();
  const [search, setSearch] = useState('');
  const [selectedDist, setSelectedDist] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return distributors.filter(
      (d) =>
        !q ||
        d.businessName.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
    );
  }, [distributors, search]);

  const mappedRetailers = useMemo(() => {
    if (!selectedDist) return [];
    return retailers.filter((r) => r.distributorId === selectedDist.id);
  }, [selectedDist, retailers]);

  const columns = [
    {
      key: 'code',
      header: 'Distributor Code',
      sortable: true,
      render: (d) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {d.code}
        </span>
      ),
    },
    {
      key: 'businessName',
      header: 'Distributor & Head',
      sortable: true,
      render: (d) => (
        <div>
          <p className="font-medium text-slate-900">{d.businessName}</p>
          <p className="text-xs text-slate-500">
            {d.ownerName} · {d.mobile}
          </p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Territory',
      render: (d) => (
        <span className="text-xs text-slate-600">
          {d.city}, {d.state} · {d.region}
        </span>
      ),
    },
    {
      key: 'retailerCount',
      header: 'Retailers',
      align: 'right',
      sortable: true,
      render: (d) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatNumber(
            retailers.filter((r) => r.distributorId === d.id).length
          )}
        </span>
      ),
    },
    {
      key: 'monthlyVolume',
      header: 'Monthly Volume',
      align: 'right',
      sortable: true,
      render: (d) => (
        <span className="font-mono text-slate-900">
          {formatINR(d.monthlyVolume, { compact: true })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: 'actions',
      header: 'Hierarchy',
      align: 'right',
      render: (d) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDist(d);
          }}
        >
          View Network
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distributor Management"
        subtitle="Regional channel partners, distributor territories, and mapped retailer hierarchies."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Distributors"
          value={formatNumber(distributors.length)}
          subtext="Regional partner entities"
          icon={Users}
          accent="navy"
        />
        <StatCard
          title="Active Partners"
          value={formatNumber(distributors.filter((d) => d.status === 'active').length)}
          subtext="Operational territories"
          accent="teal"
        />
        <StatCard
          title="Combined Monthly Volume"
          value={formatINR(
            distributors.reduce((acc, d) => acc + d.monthlyVolume, 0),
            { compact: true }
          )}
          subtext="Channel-attributed throughput"
          accent="cyan"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(d) => setSelectedDist(d)}
        toolbar={
          <div className="w-full sm:max-w-xs">
            <Input
              icon={Search}
              placeholder="Search distributor, code, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <Modal
        open={Boolean(selectedDist)}
        onClose={() => setSelectedDist(null)}
        title={selectedDist ? selectedDist.businessName : ''}
        subtitle={
          selectedDist
            ? `${selectedDist.code} · ${selectedDist.region} · Joined ${formatDate(
                selectedDist.joinedAt
              )}`
            : ''
        }
        size="xl"
        footer={
          <Button variant="primary" onClick={() => setSelectedDist(null)}>
            Close
          </Button>
        }
      >
        {selectedDist && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Primary Contact</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedDist.ownerName}
                </p>
                <p className="text-xs text-slate-500">{selectedDist.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Monthly Volume</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {formatINR(selectedDist.monthlyVolume, { compact: true })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Distributor Commission</p>
                <p className="mt-1 font-mono text-lg font-bold text-teal-700 tabular-nums">
                  {formatINR(selectedDist.commissionEarned)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-display text-sm font-semibold text-slate-900">
                Mapped Retailer Hierarchy ({mappedRetailers.length})
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="px-4 py-2.5 font-medium">Retailer Code</th>
                      <th className="px-4 py-2.5 font-medium">Outlet</th>
                      <th className="px-4 py-2.5 font-medium">City</th>
                      <th className="px-4 py-2.5 font-medium text-right">Wallet Balance</th>
                      <th className="px-4 py-2.5 font-medium">KYC</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappedRetailers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                          No retailers mapped to this distributor yet.
                        </td>
                      </tr>
                    ) : (
                      mappedRetailers.map((ret) => (
                        <tr key={ret.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-2.5 font-mono font-medium text-slate-900">
                            {ret.code}
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-slate-900">{ret.outletName}</p>
                            <p className="text-[11px] text-slate-500">{ret.ownerName}</p>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{ret.city}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-900 tabular-nums">
                            {formatINR(ret.walletBalance)}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={ret.kycStatus} />
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={ret.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
