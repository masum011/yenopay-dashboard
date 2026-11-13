import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { DashboardOverview } from '../pages/DashboardOverview.jsx';
import { RetailersPage } from '../pages/RetailersPage.jsx';
import { DistributorsPage } from '../pages/DistributorsPage.jsx';
import { TransactionsPage } from '../pages/TransactionsPage.jsx';
import { WalletsPage } from '../pages/WalletsPage.jsx';
import { CommissionsPage } from '../pages/CommissionsPage.jsx';
import { SettlementsPage } from '../pages/SettlementsPage.jsx';
import { ReportsPage } from '../pages/ReportsPage.jsx';
import { ApiProvidersPage } from '../pages/ApiProvidersPage.jsx';
import { SupportPage } from '../pages/SupportPage.jsx';
import { AuditLogsPage } from '../pages/AuditLogsPage.jsx';
import { AdminSettingsPage } from '../pages/AdminSettingsPage.jsx';

export function AdminRoutes({ basePath = '', onSwitchPortal }) {
  return (
    <Routes>
      <Route
        element={
          <AdminLayout basePath={basePath} onSwitchPortal={onSwitchPortal} />
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="retailers" element={<RetailersPage />} />
        <Route path="distributors" element={<DistributorsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="wallets" element={<WalletsPage />} />
        <Route path="commissions" element={<CommissionsPage />} />
        <Route path="settlements" element={<SettlementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="api-providers" element={<ApiProvidersPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
