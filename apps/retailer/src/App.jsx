import React from 'react';
import { NotificationProvider, SupabaseAuthProvider } from '@yenopay/shared-ui';
import { supabase } from '@yenopay/shared-utils';
import { RetailerStoreProvider } from './hooks/useRetailerStore.jsx';
import { RetailerRoutes } from './routes/RetailerRoutes.jsx';

export function RetailerApp({ basePath = '', onSwitchPortal }) {
  return (
    <SupabaseAuthProvider
      client={supabase}
      requiredRole="retailer"
      portalLabel="Retailer Portal"
    >
      <NotificationProvider>
        <RetailerStoreProvider>
          <RetailerRoutes basePath={basePath} onSwitchPortal={onSwitchPortal} />
        </RetailerStoreProvider>
      </NotificationProvider>
    </SupabaseAuthProvider>
  );
}

export default RetailerApp;
