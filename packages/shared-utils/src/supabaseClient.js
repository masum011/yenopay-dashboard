import { createClient } from '@supabase/supabase-js';

export const YENOPAY_ROLES = {
  SUPER_ADMIN: 'super_admin',
  RETAILER: 'retailer',
  DISTRIBUTOR: 'distributor',
};

const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_SUPABASE_URL
  : '';

const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Future service adapter helper:
 * In V1, dashboards operate with the structured mock service layer when
 * Supabase credentials are absent. In V2, services query Supabase tables
 * protected by Row Level Security (RLS) and invoke Edge Functions for banking APIs.
 */
export function getDataSourceMode() {
  return isSupabaseConfigured ? 'supabase' : 'v1_mock';
}
