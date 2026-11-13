import React from 'react';
import { NotificationProvider, SupabaseAuthProvider } from '@yenopay/shared-ui';
import { supabase } from '@yenopay/shared-utils';
import { AdminStoreProvider } from './hooks/useAdminStore.jsx';
import { AdminRoutes } from './routes/AdminRoutes.jsx';

export function SuperAdminApp({ basePath = '', onSwitchPortal }) {
  return (
    <SupabaseAuthProvider
      client={supabase}
      requiredRole="super_admin"
      portalLabel="Super Admin"
    >
      <NotificationProvider>
        <AdminStoreProvider>
          <AdminRoutes basePath={basePath} onSwitchPortal={onSwitchPortal} />
        </AdminStoreProvider>
      </NotificationProvider>
    </SupabaseAuthProvider>
  );
}

export default SuperAdminApp;
