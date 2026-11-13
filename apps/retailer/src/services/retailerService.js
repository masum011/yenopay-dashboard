import { getDataSourceMode, supabase } from '@yenopay/shared-utils';
import {
  INITIAL_BENEFICIARIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_RETAILER_PROFILE,
  INITIAL_RETAILER_TICKETS,
  INITIAL_RETAILER_TRANSACTIONS,
  INITIAL_RETAILER_WALLET,
  INITIAL_WALLET_HISTORY,
} from './mockRetailerData.js';

/**
 * Retailer Service Layer
 * Keeps data-access & future Supabase / Edge Function calls separate from UI components.
 * In V1, no live banking API connections or simulated real fund movements are executed.
 */
export const retailerService = {
  getSourceMode() {
    return getDataSourceMode();
  },

  async fetchDashboardData() {
    if (supabase) {
      // V2 Supabase hook: query retailer profile, wallet, and transactions via RLS.
    }
    return {
      profile: INITIAL_RETAILER_PROFILE,
      wallet: INITIAL_RETAILER_WALLET,
      beneficiaries: INITIAL_BENEFICIARIES,
      transactions: INITIAL_RETAILER_TRANSACTIONS,
      walletHistory: INITIAL_WALLET_HISTORY,
      tickets: INITIAL_RETAILER_TICKETS,
      notifications: INITIAL_NOTIFICATIONS,
    };
  },
};
