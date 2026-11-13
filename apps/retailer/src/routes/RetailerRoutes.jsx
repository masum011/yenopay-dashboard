import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RetailerLayout } from '../layouts/RetailerLayout.jsx';
import { RetailerOverview } from '../pages/RetailerOverview.jsx';
import { AepsPage } from '../pages/AepsPage.jsx';
import { MoneyTransferPage } from '../pages/MoneyTransferPage.jsx';
import { CashDepositPage } from '../pages/CashDepositPage.jsx';
import { MicroAtmPage } from '../pages/MicroAtmPage.jsx';
import { BillPaymentsPage } from '../pages/BillPaymentsPage.jsx';
import { RetailerWalletPage } from '../pages/RetailerWalletPage.jsx';
import { RetailerTransactionsPage } from '../pages/RetailerTransactionsPage.jsx';
import { RetailerCommissionPage } from '../pages/RetailerCommissionPage.jsx';
import { ProfileKycPage } from '../pages/ProfileKycPage.jsx';
import { RetailerSupportPage } from '../pages/RetailerSupportPage.jsx';
import { RetailerNotificationsPage } from '../pages/RetailerNotificationsPage.jsx';
import { RetailerSettingsPage } from '../pages/RetailerSettingsPage.jsx';

export function RetailerRoutes({ basePath = '', onSwitchPortal }) {
  return (
    <Routes>
      <Route
        element={
          <RetailerLayout basePath={basePath} onSwitchPortal={onSwitchPortal} />
        }
      >
        <Route index element={<RetailerOverview />} />
        <Route path="aeps" element={<AepsPage />} />
        <Route path="dmt" element={<MoneyTransferPage />} />
        <Route path="cash-deposit" element={<CashDepositPage />} />
        <Route path="micro-atm" element={<MicroAtmPage />} />
        <Route path="bill-payments" element={<BillPaymentsPage />} />
        <Route path="wallet" element={<RetailerWalletPage />} />
        <Route path="transactions" element={<RetailerTransactionsPage />} />
        <Route path="commissions" element={<RetailerCommissionPage />} />
        <Route path="profile-kyc" element={<ProfileKycPage />} />
        <Route path="support" element={<RetailerSupportPage />} />
        <Route path="notifications" element={<RetailerNotificationsPage />} />
        <Route path="settings" element={<RetailerSettingsPage />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
