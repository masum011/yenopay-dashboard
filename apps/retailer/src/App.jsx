import React from 'react';
import { NotificationProvider } from '@yenopay/shared-ui';
import { RetailerStoreProvider } from './hooks/useRetailerStore.jsx';
import { RetailerRoutes } from './routes/RetailerRoutes.jsx';

export function RetailerApp({ basePath = '', onSwitchPortal }) {
  return (
    <NotificationProvider>
      <RetailerStoreProvider>
        <RetailerRoutes basePath={basePath} onSwitchPortal={onSwitchPortal} />
      </RetailerStoreProvider>
    </NotificationProvider>
  );
}

export default RetailerApp;
