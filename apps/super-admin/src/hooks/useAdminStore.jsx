import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  INITIAL_ADMIN_SETTINGS,
  INITIAL_API_PROVIDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_COMMISSION_SLABS,
  INITIAL_DISTRIBUTORS,
  INITIAL_RETAILERS,
  INITIAL_SETTLEMENTS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_TRANSACTIONS,
  INITIAL_WALLET_LEDGER,
} from '../services/mockAdminData.js';

const AdminStoreContext = createContext(null);

export function AdminStoreProvider({ children }) {
  const [distributors, setDistributors] = useState(INITIAL_DISTRIBUTORS);
  const [retailers, setRetailers] = useState(INITIAL_RETAILERS);
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [walletLedger, setWalletLedger] = useState(INITIAL_WALLET_LEDGER);
  const [commissionSlabs, setCommissionSlabs] = useState(INITIAL_COMMISSION_SLABS);
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [apiProviders, setApiProviders] = useState(INITIAL_API_PROVIDERS);
  const [supportTickets, setSupportTickets] = useState(INITIAL_SUPPORT_TICKETS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState(INITIAL_ADMIN_SETTINGS);

  const appendAudit = (action, resource) => {
    setAuditLogs((prev) => [
      {
        id: `AUD-${1043 + prev.length}`,
        actorName: 'Vikramaditya Mehta',
        actorRole: 'Super Admin',
        action,
        resource,
        ipAddress: '103.21.58.14',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addRetailer = (payload) => {
    const dist = distributors.find((d) => d.id === payload.distributorId);
    const newRetailer = {
      id: `RET-${2009 + retailers.length}`,
      code: `YPR-${10120 + retailers.length}`,
      outletName: payload.outletName.trim(),
      ownerName: payload.ownerName.trim(),
      mobile: payload.mobile.trim(),
      email: payload.email.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      distributorId: payload.distributorId,
      distributorName: dist ? dist.businessName : 'Direct Platform',
      kycStatus: payload.kycStatus || 'pending',
      status: 'active',
      panNumber: (payload.panNumber || '').toUpperCase(),
      aadhaarNumber: payload.aadhaarNumber || '',
      gstNumber: (payload.gstNumber || '').toUpperCase(),
      walletBalance: Number(payload.initialDeposit || 0),
      lienBalance: 0,
      monthlyVolume: 0,
      commissionPlan: payload.commissionPlan || 'Standard Tier',
      joinedAt: new Date().toISOString(),
    };
    setRetailers((prev) => [newRetailer, ...prev]);
    if (dist) {
      setDistributors((prev) =>
        prev.map((d) =>
          d.id === dist.id ? { ...d, retailerCount: d.retailerCount + 1 } : d
        )
      );
    }
    appendAudit(
      `Onboarded retailer ${newRetailer.code} (${newRetailer.outletName})`,
      `retailers / ${newRetailer.id}`
    );
    return newRetailer;
  };

  const updateRetailer = (id, updates) => {
    const dist = updates.distributorId
      ? distributors.find((d) => d.id === updates.distributorId)
      : null;

    setRetailers((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updates,
              distributorName: dist ? dist.businessName : r.distributorName,
            }
          : r
      )
    );
    appendAudit(`Updated retailer profile ${id}`, `retailers / ${id}`);
  };

  const toggleRetailerStatus = (id) => {
    let target;
    setRetailers((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextStatus = r.status === 'active' ? 'suspended' : 'active';
        target = { ...r, status: nextStatus };
        return target;
      })
    );
    if (target) {
      appendAudit(
        `${target.status === 'active' ? 'Activated' : 'Suspended'} retailer ${target.code}`,
        `retailers / ${id}`
      );
    }
  };

  const adjustWallet = ({ retailerId, direction, amount, referenceNo, narration }) => {
    const numericAmount = Number(amount);
    const retailer = retailers.find((r) => r.id === retailerId);
    if (!retailer) return { ok: false, error: 'Retailer not found' };
    if (direction === 'debit' && retailer.walletBalance < numericAmount) {
      return { ok: false, error: 'Insufficient wallet balance for debit adjustment.' };
    }

    const nextBalance =
      direction === 'credit'
        ? retailer.walletBalance + numericAmount
        : retailer.walletBalance - numericAmount;

    setRetailers((prev) =>
      prev.map((r) =>
        r.id === retailerId ? { ...r, walletBalance: nextBalance } : r
      )
    );

    const ledgerEntry = {
      id: `WLED-${510 + walletLedger.length}`,
      retailerId,
      retailerName: retailer.outletName,
      direction,
      amount: numericAmount,
      balanceAfter: nextBalance,
      referenceNo: referenceNo.trim(),
      narration: narration.trim(),
      createdAt: new Date().toISOString(),
    };
    setWalletLedger((prev) => [ledgerEntry, ...prev]);
    appendAudit(
      `Manual wallet ${direction} of ₹${numericAmount.toLocaleString('en-IN')} for ${retailer.code}`,
      `wallets / ${retailerId}`
    );
    return { ok: true, entry: ledgerEntry };
  };

  const updateCommissionSlab = (id, updates) => {
    setCommissionSlabs((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      )
    );
    appendAudit(`Updated commission slab ${id}`, `commission_slabs / ${id}`);
  };

  const processSettlement = (id, nextStatus, utrValue) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: nextStatus,
              utr: utrValue || s.utr || `IMPS${Date.now().toString().slice(-10)}`,
              settledAt: nextStatus === 'settled' ? new Date().toISOString() : null,
            }
          : s
      )
    );
    appendAudit(
      `Marked settlement ${id} as ${nextStatus}`,
      `settlements / ${id}`
    );
  };

  const updateApiProvider = (id, updates) => {
    setApiProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    appendAudit(`Updated provider configuration ${id}`, `api_providers / ${id}`);
  };

  const updateSupportTicket = (id, updates) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    appendAudit(`Updated support ticket ${id}`, `support_tickets / ${id}`);
  };

  const saveSettings = (nextSettings) => {
    setSettings(nextSettings);
    appendAudit('Updated platform operational settings', 'platform_settings / global');
  };

  const overviewMetrics = useMemo(() => {
    const totalRetailers = retailers.length;
    const activeRetailers = retailers.filter((r) => r.status === 'active').length;
    const totalTxns = transactions.length;
    const successTxns = transactions.filter((t) => t.status === 'success').length;
    const failedPendingTxns = transactions.filter(
      (t) => t.status === 'failed' || t.status === 'pending'
    ).length;
    const platformRevenue = transactions.reduce(
      (acc, t) => acc + (t.status === 'success' ? t.platformRevenue : 0),
      0
    );
    const pendingSettlementsAmount = settlements
      .filter((s) => s.status === 'pending')
      .reduce((acc, s) => acc + s.amount, 0);

    return {
      totalRetailers,
      activeRetailers,
      totalTxns,
      successTxns,
      failedPendingTxns,
      platformRevenue,
      pendingSettlementsAmount,
      pendingSettlementCount: settlements.filter((s) => s.status === 'pending').length,
    };
  }, [retailers, transactions, settlements]);

  const value = {
    distributors,
    retailers,
    transactions,
    walletLedger,
    commissionSlabs,
    settlements,
    apiProviders,
    supportTickets,
    auditLogs,
    settings,
    overviewMetrics,
    addRetailer,
    updateRetailer,
    toggleRetailerStatus,
    adjustWallet,
    updateCommissionSlab,
    processSettlement,
    updateApiProvider,
    updateSupportTicket,
    saveSettings,
  };

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) {
    throw new Error('useAdminStore must be used inside AdminStoreProvider');
  }
  return ctx;
}
