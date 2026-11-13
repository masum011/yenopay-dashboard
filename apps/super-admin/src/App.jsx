import React from 'react';
import { NotificationProvider } from '@yenopay/shared-ui';
import { AdminStoreProvider } from './hooks/useAdminStore.jsx';
import { AdminRoutes } from './routes/AdminRoutes.jsx';

export function SuperAdminApp({ basePath = '', onSwitchPortal }) {
  return (
    <NotificationProvider>
      <AdminStoreProvider>
        <AdminRoutes basePath={basePath} onSwitchPortal={onSwitchPortal} />
      </AdminStoreProvider>
    </NotificationProvider>
  );
}

export default SuperAdminApp;
