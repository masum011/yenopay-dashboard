import React from 'react';
import { PageHeader, StatusBadge } from '@yenopay/shared-ui';
import { formatDate, maskAccountNumber, maskAadhaar } from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';

export function ProfileKycPage() {
  const { profile } = useRetailerStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retailer Profile & KYC"
        subtitle="Verified merchant identity, outlet details, settlement bank mandate, and KYC documents."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                {profile.outletName}
              </h2>
              <p className="font-mono text-xs text-slate-500">
                Retailer Code: {profile.code} · {profile.commissionPlan}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={profile.status} />
              <StatusBadge status={profile.kycStatus} />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Proprietor Name</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{profile.ownerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Registered Mobile</dt>
              <dd className="mt-0.5 font-mono text-slate-900">{profile.mobile}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Email Address</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Assigned Distributor</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {profile.distributorName}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Outlet Address</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {profile.address}, {profile.city}, {profile.state} — {profile.pincode}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">PAN / Aadhaar</dt>
              <dd className="mt-0.5 font-mono text-xs text-slate-900">
                {profile.panNumber} · {maskAadhaar(profile.aadhaarNumber)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">GSTIN</dt>
              <dd className="mt-0.5 font-mono text-xs text-slate-900">
                {profile.gstNumber || 'Not Registered'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Settlement Bank Mandate
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Verified primary bank account for wallet payouts
          </p>
          <dl className="mt-5 space-y-3 text-xs">
            <div>
              <dt className="text-slate-500">Account Holder</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">
                {profile.settlementBank.accountHolder}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Bank Name</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {profile.settlementBank.bankName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Account Number</dt>
              <dd className="mt-0.5 font-mono font-medium text-slate-900">
                {maskAccountNumber(profile.settlementBank.accountNumber)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">IFSC Code</dt>
              <dd className="mt-0.5 font-mono font-medium text-slate-900">
                {profile.settlementBank.ifsc}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-slate-900">
            KYC Document Checklist
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="px-5 py-3">Document Type</th>
                <th className="px-5 py-3">Identifier</th>
                <th className="px-5 py-3">Verification</th>
                <th className="px-5 py-3">Verified On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profile.kycDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{doc.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">
                    {doc.number}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {formatDate(doc.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
