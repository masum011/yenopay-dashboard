import { getDataSourceMode, supabase } from '@yenopay/shared-utils';
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
} from './mockAdminData.js';

/**
 * Admin Service Layer
 * Separates data-fetching & future Supabase RPCs from React presentation components.
 */
export const adminService = {
  getSourceMode() {
    return getDataSourceMode();
  },

  async fetchInitialSnapshot() {
    if (supabase) {
      // V2 Supabase integration hook:
      // Queries public.retailers, public.transactions, public.settlements, etc. via RLS.
    }
    return {
      distributors: INITIAL_DISTRIBUTORS,
      retailers: INITIAL_RETAILERS,
      transactions: INITIAL_TRANSACTIONS,
      walletLedger: INITIAL_WALLET_LEDGER,
      commissionSlabs: INITIAL_COMMISSION_SLABS,
      settlements: INITIAL_SETTLEMENTS,
      apiProviders: INITIAL_API_PROVIDERS,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: INITIAL_ADMIN_SETTINGS,
    };
  },
};
