import React, { useMemo, useState } from 'react';
import { Plus, Search, Eye, Edit3, Power } from 'lucide-react';
import {
  Button,
  ConfirmDialog,
  DataTable,
  Dropdown,
  Input,
  Modal,
  PageHeader,
  StatusBadge,
  useNotification,
} from '@yenopay/shared-ui';
import {
  formatDate,
  formatINR,
  isValidEmail,
  isValidMobile,
  isValidPAN,
  maskAadhaar,
} from '@yenopay/shared-utils';
import { useAdminStore } from '../hooks/useAdminStore.jsx';

const EMPTY_FORM = {
  outletName: '',
  ownerName: '',
  mobile: '',
  email: '',
  city: '',
  state: '',
  distributorId: 'DIST-101',
  panNumber: '',
  aadhaarNumber: '',
  gstNumber: '',
  commissionPlan: 'Standard Tier',
  kycStatus: 'pending',
  initialDeposit: '0',
};

export function RetailersPage() {
  const {
    retailers,
    distributors,
    addRetailer,
    updateRetailer,
    toggleRetailerStatus,
  } = useAdminStore();
  const { notify } = useNotification();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [detailRetailer, setDetailRetailer] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const filteredRetailers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return retailers.filter((r) => {
      const matchesQuery =
        !q ||
        r.outletName.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        r.city.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesKyc = kycFilter === 'all' || r.kycStatus === kycFilter;
      return matchesQuery && matchesStatus && matchesKyc;
    });
  }, [retailers, search, statusFilter, kycFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (retailer) => {
    setEditingId(retailer.id);
    setForm({
      outletName: retailer.outletName,
      ownerName: retailer.ownerName,
      mobile: retailer.mobile,
      email: retailer.email,
      city: retailer.city,
      state: retailer.state,
      distributorId: retailer.distributorId || 'DIST-101',
      panNumber: retailer.panNumber || '',
      aadhaarNumber: retailer.aadhaarNumber || '',
      gstNumber: retailer.gstNumber || '',
      commissionPlan: retailer.commissionPlan || 'Standard Tier',
      kycStatus: retailer.kycStatus,
      initialDeposit: String(retailer.walletBalance || 0),
    });
    setErrors({});
    setFormOpen(true);
  };

  const validateForm = () => {
    const next = {};
    if (!form.outletName.trim()) next.outletName = 'Outlet name is required.';
    if (!form.ownerName.trim()) next.ownerName = 'Owner name is required.';
    if (!isValidMobile(form.mobile)) next.mobile = 'Enter a valid 10-digit Indian mobile number.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.state.trim()) next.state = 'State is required.';
    if (form.panNumber && !isValidPAN(form.panNumber)) {
      next.panNumber = 'PAN format must be e.g. ABCPK4829L.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId) {
      updateRetailer(editingId, {
        outletName: form.outletName.trim(),
        ownerName: form.ownerName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        distributorId: form.distributorId,
        panNumber: form.panNumber.toUpperCase(),
        gstNumber: form.gstNumber.toUpperCase(),
        commissionPlan: form.commissionPlan,
        kycStatus: form.kycStatus,
      });
      notify({
        type: 'success',
        title: 'Retailer updated',
        message: `${form.outletName} details have been saved.`,
      });
    } else {
      const created = addRetailer(form);
      notify({
        type: 'success',
        title: 'Retailer onboarded',
        message: `${created.outletName} (${created.code}) added to network.`,
      });
    }
    setFormOpen(false);
  };

  const handleConfirmToggle = () => {
    if (!confirmTarget) return;
    toggleRetailerStatus(confirmTarget.id);
    notify({
      type: confirmTarget.status === 'active' ? 'info' : 'success',
      title:
        confirmTarget.status === 'active'
          ? 'Retailer suspended'
          : 'Retailer activated',
      message: `${confirmTarget.outletName} status updated.`,
    });
    setConfirmTarget(null);
  };

  const columns = [
    {
      key: 'code',
      header: 'Retailer ID',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {r.code}
          </span>
          <p className="text-[11px] text-slate-500">{r.distributorName}</p>
        </div>
      ),
    },
    {
      key: 'outletName',
      header: 'Outlet & Owner',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.outletName}</p>
          <p className="text-xs text-slate-500">
            {r.ownerName} · {r.mobile}
          </p>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (r) => (
        <span className="text-xs text-slate-600">
          {r.city}, {r.state}
        </span>
      ),
    },
    {
      key: 'kycStatus',
      header: 'KYC',
      render: (r) => <StatusBadge status={r.kycStatus} />,
    },
    {
      key: 'walletBalance',
      header: 'Wallet Balance',
      align: 'right',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-mono font-semibold text-slate-900">
            {formatINR(r.walletBalance)}
          </span>
          {r.lienBalance > 0 && (
            <p className="font-mono text-[11px] text-amber-700">
              Lien: {formatINR(r.lienBalance)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div
          className="inline-flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setDetailRetailer(r)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(r)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-cyan-700 cursor-pointer"
            title="Edit retailer"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmTarget(r)}
            className={`rounded-md p-1.5 cursor-pointer ${
              r.status === 'active'
                ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
            title={r.status === 'active' ? 'Suspend retailer' : 'Activate retailer'}
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retailer Management"
        subtitle="Manage merchant onboarding, KYC verification status, wallet balances, and operational access."
        actions={
          <Button variant="primary" icon={Plus} onClick={openAddModal}>
            Add Retailer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filteredRetailers}
        onRowClick={(r) => setDetailRetailer(r)}
        emptyTitle="No retailers match your filters"
        emptyDescription="Clear the active search or KYC filters, or onboard a new retailer."
        emptyActionLabel="Reset Filters"
        onEmptyAction={() => {
          setSearch('');
          setStatusFilter('all');
          setKycFilter('all');
        }}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                icon={Search}
                placeholder="Search code, outlet, mobile, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-40">
                <Dropdown
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All KYC Status' },
                    { value: 'verified', label: 'Verified' },
                    { value: 'under_review', label: 'Under Review' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />
              </div>
              <div className="w-36">
                <Dropdown
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Accounts' },
                    { value: 'active', label: 'Active' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </div>
            </div>
          </div>
        }
      />

      {/* Add / Edit Retailer Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Retailer Profile' : 'Onboard New Retailer'}
        subtitle="Configure outlet details, distributor mapping, and KYC state."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="retailer-form">
              {editingId ? 'Save Changes' : 'Create Retailer'}
            </Button>
          </>
        }
      >
        <form id="retailer-form" onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Outlet / Business Name"
            required
            value={form.outletName}
            onChange={(e) => setForm({ ...form, outletName: e.target.value })}
            error={errors.outletName}
            placeholder="e.g. Bharat Digital Kendra"
          />
          <Input
            label="Owner Full Name"
            required
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            error={errors.ownerName}
            placeholder="e.g. Rohan Deshmukh"
          />
          <Input
            label="Mobile Number"
            required
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            error={errors.mobile}
            placeholder="10-digit mobile"
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            placeholder="merchant@domain.in"
          />
          <Input
            label="City"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            error={errors.city}
          />
          <Input
            label="State"
            required
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            error={errors.state}
          />
          <Dropdown
            label="Assigned Distributor"
            value={form.distributorId}
            onChange={(e) => setForm({ ...form, distributorId: e.target.value })}
            options={distributors.map((d) => ({
              value: d.id,
              label: `${d.businessName} (${d.city})`,
            }))}
          />
          <Dropdown
            label="Commission Plan"
            value={form.commissionPlan}
            onChange={(e) => setForm({ ...form, commissionPlan: e.target.value })}
            options={[
              { value: 'Standard Tier', label: 'Standard Tier' },
              { value: 'Gold Tier', label: 'Gold Tier' },
              { value: 'Platinum Tier', label: 'Platinum Tier' },
            ]}
          />
          <Input
            label="PAN Number"
            value={form.panNumber}
            onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
            error={errors.panNumber}
            placeholder="ABCPK4829L"
          />
          <Input
            label="GSTIN (Optional)"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
            placeholder="27ABCPK4829L1Z5"
          />
          <Dropdown
            label="KYC Verification Status"
            value={form.kycStatus}
            onChange={(e) => setForm({ ...form, kycStatus: e.target.value })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'verified', label: 'Verified' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          {!editingId && (
            <Input
              label="Opening Wallet Credit (₹)"
              type="number"
              min="0"
              value={form.initialDeposit}
              onChange={(e) => setForm({ ...form, initialDeposit: e.target.value })}
            />
          )}
        </form>
      </Modal>

      {/* Retailer Details Modal */}
      <Modal
        open={Boolean(detailRetailer)}
        onClose={() => setDetailRetailer(null)}
        title={detailRetailer ? detailRetailer.outletName : ''}
        subtitle={
          detailRetailer
            ? `${detailRetailer.code} · Joined ${formatDate(detailRetailer.joinedAt)}`
            : ''
        }
        size="lg"
        footer={
          detailRetailer && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  const target = detailRetailer;
                  setDetailRetailer(null);
                  openEditModal(target);
                }}
              >
                Edit Profile
              </Button>
              <Button variant="primary" onClick={() => setDetailRetailer(null)}>
                Close
              </Button>
            </>
          )
        }
      >
        {detailRetailer && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={detailRetailer.status} />
              <StatusBadge status={detailRetailer.kycStatus} />
              <span className="text-xs text-slate-500">
                Plan: <strong className="text-slate-800">{detailRetailer.commissionPlan}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Available Wallet</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {formatINR(detailRetailer.walletBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Lien / Hold Balance</p>
                <p className="mt-1 font-mono text-lg font-semibold text-amber-700 tabular-nums">
                  {formatINR(detailRetailer.lienBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">30-Day Volume</p>
                <p className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                  {formatINR(detailRetailer.monthlyVolume, { compact: true })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Owner Name</p>
                <p className="mt-0.5 font-medium text-slate-900">{detailRetailer.ownerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Contact</p>
                <p className="mt-0.5 font-medium text-slate-900">
                  {detailRetailer.mobile} · {detailRetailer.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="mt-0.5 font-medium text-slate-900">
                  {detailRetailer.city}, {detailRetailer.state}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Distributor</p>
                <p className="mt-0.5 font-medium text-slate-900">
                  {detailRetailer.distributorName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">PAN / Aadhaar</p>
                <p className="mt-0.5 font-mono text-xs text-slate-900">
                  {detailRetailer.panNumber || '—'} · {maskAadhaar(detailRetailer.aadhaarNumber)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">GSTIN</p>
                <p className="mt-0.5 font-mono text-xs text-slate-900">
                  {detailRetailer.gstNumber || 'Not Registered'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Activate / Suspend Confirmation */}
      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmToggle}
        variant={confirmTarget?.status === 'active' ? 'danger' : 'warning'}
        title={
          confirmTarget?.status === 'active'
            ? 'Suspend Retailer Access?'
            : 'Activate Retailer Account?'
        }
        description={
          confirmTarget?.status === 'active'
            ? `Suspending ${confirmTarget?.outletName} (${confirmTarget?.code}) will immediately pause AEPS, DMT, and payout services for this merchant.`
            : `Reactivating ${confirmTarget?.outletName} (${confirmTarget?.code}) will restore platform transaction access.`
        }
        confirmLabel={
          confirmTarget?.status === 'active' ? 'Suspend Retailer' : 'Activate Retailer'
        }
      />
    </div>
  );
}
