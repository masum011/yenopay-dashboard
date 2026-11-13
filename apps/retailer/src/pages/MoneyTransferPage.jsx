import React, { useMemo, useState } from 'react';
import { Plus, Receipt, Search, Send, UserPlus } from 'lucide-react';
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
import {
  formatDateTime,
  formatINR,
  isValidAccountNumber,
  isValidIFSC,
  isValidMobile,
  maskAccountNumber,
  validateAmount,
} from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';
import { INDIAN_BANKS } from '../services/mockRetailerData.js';
import { TransactionReceiptModal } from '../components/TransactionReceiptModal.jsx';
import {
  V1BankingBanner,
  V1PreviewValidationModal,
} from '../components/V1SandboxNotice.jsx';

export function MoneyTransferPage() {
  const { beneficiaries, transactions, profile, addBeneficiary } =
    useRetailerStore();
  const { notify } = useNotification();

  const [senderMobile, setSenderMobile] = useState('9822104455');
  const [selectedBenId, setSelectedBenId] = useState(
    beneficiaries[0]?.id || ''
  );
  const [transferMode, setTransferMode] = useState('IMPS');
  const [amount, setAmount] = useState('5000');
  const [transferError, setTransferError] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [benForm, setBenForm] = useState({
    name: '',
    mobile: '',
    bankName: INDIAN_BANKS[0],
    accountNumber: '',
    ifsc: '',
  });
  const [benErrors, setBenErrors] = useState({});

  const [previewPayload, setPreviewPayload] = useState(null);
  const [receiptTxn, setReceiptTxn] = useState(null);

  const selectedBen = useMemo(
    () => beneficiaries.find((b) => b.id === selectedBenId) || beneficiaries[0],
    [beneficiaries, selectedBenId]
  );

  const dmtHistory = useMemo(
    () => transactions.filter((t) => t.service === 'DMT'),
    [transactions]
  );

  const estimatedFee = useMemo(() => {
    const num = Number(amount || 0);
    if (num <= 0) return 0;
    return Math.max(10, Math.round(num * 0.006));
  }, [amount]);

  const handleAddBeneficiary = (e) => {
    e.preventDefault();
    const next = {};
    if (!benForm.name.trim()) next.name = 'Beneficiary name is required.';
    if (!isValidMobile(benForm.mobile))
      next.mobile = 'Enter a valid 10-digit mobile number.';
    if (!isValidAccountNumber(benForm.accountNumber))
      next.accountNumber = 'Account number must be 9 to 18 digits.';
    if (!isValidIFSC(benForm.ifsc))
      next.ifsc = 'Enter valid 11-character IFSC (e.g. SBIN0001124).';
    setBenErrors(next);
    if (Object.keys(next).length > 0) return;

    const created = addBeneficiary(benForm);
    setSelectedBenId(created.id);
    setAddModalOpen(false);
    setBenForm({
      name: '',
      mobile: '',
      bankName: INDIAN_BANKS[0],
      accountNumber: '',
      ifsc: '',
    });
    notify({
      type: 'success',
      title: 'Beneficiary added',
      message: `${created.name} added to your DMT beneficiary directory.`,
    });
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!isValidMobile(senderMobile)) {
      setTransferError('Enter a valid 10-digit sender mobile number.');
      return;
    }
    if (!selectedBen) {
      setTransferError('Select a destination beneficiary first.');
      return;
    }
    const amtErr = validateAmount(amount, 100, 25000);
    if (amtErr) {
      setTransferError(amtErr);
      return;
    }
    setTransferError('');

    setPreviewPayload({
      Service: 'Domestic Money Transfer (DMT)',
      'Transfer Rail': transferMode,
      'Sender Mobile': senderMobile,
      Beneficiary: selectedBen.name,
      'Destination Bank': `${selectedBen.bankName} (${selectedBen.ifsc})`,
      'Account Number': maskAccountNumber(selectedBen.accountNumber),
      'Transfer Amount': formatINR(amount),
      'Estimated Convenience Fee': formatINR(estimatedFee),
      'Execution Status': 'Validated locally (V1 — Live bank transfer disabled)',
    });
  };

  const historyColumns = [
    {
      key: 'id',
      header: 'TXN ID',
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {t.id}
          </span>
          <p className="font-mono text-[11px] text-slate-500">{t.utr}</p>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Beneficiary & Bank',
      render: (t) => (
        <div>
          <p className="font-medium text-slate-900">{t.customerName}</p>
          <p className="text-xs text-slate-500">
            {t.bankName} · {t.subType}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatINR(t.amount)}
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
      header: 'Timestamp',
      render: (t) => (
        <span className="text-xs text-slate-500">{formatDateTime(t.createdAt)}</span>
      ),
    },
    {
      key: 'receipt',
      header: '',
      align: 'right',
      render: (t) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Receipt}
          onClick={() => setReceiptTxn(t)}
        >
          Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Money Transfer (DMT)"
        subtitle="Manage customer beneficiaries and initiate IMPS / NEFT bank transfers."
        actions={
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setAddModalOpen(true)}
          >
            Add Beneficiary
          </Button>
        }
      />

      <V1BankingBanner serviceName="Domestic Money Transfer" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Beneficiary Directory */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Beneficiaries ({beneficiaries.length})
            </h2>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:text-cyan-800 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          <div className="space-y-2.5">
            {beneficiaries.map((ben) => {
              const active = selectedBen?.id === ben.id;
              return (
                <button
                  key={ben.id}
                  type="button"
                  onClick={() => setSelectedBenId(ben.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-cyan-500 bg-cyan-50/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {ben.name}
                    </p>
                    {ben.verified && (
                      <span className="text-[11px] font-medium text-teal-700">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{ben.bankName}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {maskAccountNumber(ben.accountNumber)} · {ben.ifsc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Money Transfer Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Money Transfer Counter
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Verify sender mobile and destination account details before submission.
          </p>

          <form onSubmit={handleTransferSubmit} className="mt-5 space-y-4">
            {transferError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                {transferError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Remitter / Sender Mobile"
                icon={Search}
                required
                maxLength={10}
                value={senderMobile}
                onChange={(e) => setSenderMobile(e.target.value)}
              />
              <Dropdown
                label="Transfer Mode"
                value={transferMode}
                onChange={(e) => setTransferMode(e.target.value)}
                options={[
                  { value: 'IMPS', label: 'IMPS (Instant 24x7)' },
                  { value: 'NEFT', label: 'NEFT (Batch Clearance)' },
                ]}
              />
            </div>

            {selectedBen && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Selected Destination Account
                </p>
                <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
                  <div>
                    <span className="text-slate-500">Beneficiary: </span>
                    <strong className="text-slate-900">{selectedBen.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Bank: </span>
                    <strong className="text-slate-900">{selectedBen.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">A/C & IFSC: </span>
                    <strong className="font-mono text-slate-900">
                      {maskAccountNumber(selectedBen.accountNumber)} · {selectedBen.ifsc}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Transfer Amount (₹100 – ₹25,000)"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                <p className="text-xs text-slate-500">Estimated Total Debit</p>
                <p className="mt-0.5 font-mono text-base font-bold text-slate-900 tabular-nums">
                  {formatINR(Number(amount || 0) + estimatedFee)}
                </p>
                <p className="text-[11px] text-slate-500">
                  Includes {formatINR(estimatedFee)} convenience fee
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button variant="primary" type="submit" icon={Send}>
                Validate Transfer Payload
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">
          Transfer History & Receipts
        </h2>
        <DataTable columns={historyColumns} data={dmtHistory} pageSize={5} />
      </div>

      {/* Add Beneficiary Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Beneficiary"
        subtitle="Register a recipient bank account for Domestic Money Transfer."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="add-ben-form">
              Save Beneficiary
            </Button>
          </>
        }
      >
        <form id="add-ben-form" onSubmit={handleAddBeneficiary} className="space-y-4">
          <Input
            label="Account Holder Name"
            required
            value={benForm.name}
            onChange={(e) => setBenForm({ ...benForm, name: e.target.value })}
            error={benErrors.name}
          />
          <Input
            label="Beneficiary Mobile"
            required
            maxLength={10}
            value={benForm.mobile}
            onChange={(e) => setBenForm({ ...benForm, mobile: e.target.value })}
            error={benErrors.mobile}
          />
          <Dropdown
            label="Bank Name"
            required
            value={benForm.bankName}
            onChange={(e) => setBenForm({ ...benForm, bankName: e.target.value })}
            options={INDIAN_BANKS}
          />
          <Input
            label="Bank Account Number"
            required
            value={benForm.accountNumber}
            onChange={(e) =>
              setBenForm({ ...benForm, accountNumber: e.target.value })
            }
            error={benErrors.accountNumber}
          />
          <Input
            label="IFSC Code"
            required
            maxLength={11}
            value={benForm.ifsc}
            onChange={(e) =>
              setBenForm({ ...benForm, ifsc: e.target.value.toUpperCase() })
            }
            error={benErrors.ifsc}
            placeholder="e.g. SBIN0001124"
          />
        </form>
      </Modal>

      <V1PreviewValidationModal
        previewData={previewPayload}
        onClose={() => setPreviewPayload(null)}
      />

      <TransactionReceiptModal
        transaction={receiptTxn}
        profile={profile}
        onClose={() => setReceiptTxn(null)}
      />
    </div>
  );
}
