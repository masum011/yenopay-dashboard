import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  INITIAL_BENEFICIARIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_RETAILER_PROFILE,
  INITIAL_RETAILER_TICKETS,
  INITIAL_RETAILER_TRANSACTIONS,
  INITIAL_RETAILER_WALLET,
  INITIAL_WALLET_HISTORY,
} from '../services/mockRetailerData.js';

const RetailerStoreContext = createContext(null);

export function RetailerStoreProvider({ children }) {
  const [profile, setProfile] = useState(INITIAL_RETAILER_PROFILE);
  const [wallet] = useState(INITIAL_RETAILER_WALLET);
  const [beneficiaries, setBeneficiaries] = useState(INITIAL_BENEFICIARIES);
  const [transactions] = useState(INITIAL_RETAILER_TRANSACTIONS);
  const [walletHistory] = useState(INITIAL_WALLET_HISTORY);
  const [fundRequests, setFundRequests] = useState([
    {
      id: 'LOAD-301',
      mode: 'NEFT / Virtual Account',
      amount: 50000,
      utr: 'NEFT882910421',
      status: 'completed',
      createdAt: '2026-11-13T08:10:00Z',
    },
  ]);
  const [tickets, setTickets] = useState(INITIAL_RETAILER_TICKETS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState({
    receiptFormat: 'thermal_80mm',
    requireTpinForDmt: true,
    smsReceipts: true,
    lowBalanceThreshold: 10000,
  });

  const addBeneficiary = (payload) => {
    const entry = {
      id: `BEN-${304 + beneficiaries.length}`,
      name: payload.name.trim(),
      mobile: payload.mobile.trim(),
      bankName: payload.bankName,
      accountNumber: payload.accountNumber.trim(),
      ifsc: payload.ifsc.trim().toUpperCase(),
      verified: false,
      addedAt: new Date().toISOString(),
    };
    setBeneficiaries((prev) => [entry, ...prev]);
    return entry;
  };

  const submitFundRequest = (payload) => {
    const req = {
      id: `LOAD-${302 + fundRequests.length}`,
      mode: payload.mode,
      amount: Number(payload.amount),
      utr: payload.utr.trim().toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setFundRequests((prev) => [req, ...prev]);
    return req;
  };

  const raiseTicket = (payload) => {
    const ticket = {
      id: `TKT-${8825 + tickets.length}`,
      txnRef: payload.txnRef.trim(),
      category: payload.category,
      subject: payload.subject.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
      lastReply: 'Ticket logged in V1 support queue. Operations team will review.',
    };
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const overviewStats = useMemo(() => {
    const todayTxns = transactions.filter((t) =>
      t.createdAt.startsWith('2026-11-13')
    );
    const successTxns = transactions.filter((t) => t.status === 'success');
    const todayEarnings = todayTxns
      .filter((t) => t.status === 'success')
      .reduce((acc, t) => acc + t.commission, 0);
    const totalEarnings = successTxns.reduce((acc, t) => acc + t.commission, 0);

    return {
      todayTxnsCount: todayTxns.length,
      todayEarnings,
      totalEarnings,
      successCount: successTxns.length,
      totalCount: transactions.length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    };
  }, [transactions, notifications]);

  const value = {
    profile,
    setProfile,
    wallet,
    beneficiaries,
    transactions,
    walletHistory,
    fundRequests,
    tickets,
    notifications,
    settings,
    setSettings,
    overviewStats,
    addBeneficiary,
    submitFundRequest,
    raiseTicket,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return (
    <RetailerStoreContext.Provider value={value}>
      {children}
    </RetailerStoreContext.Provider>
  );
}

export function useRetailerStore() {
  const ctx = useContext(RetailerStoreContext);
  if (!ctx) {
    throw new Error('useRetailerStore must be used inside RetailerStoreProvider');
  }
  return ctx;
}
