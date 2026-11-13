-- YenoPay V1 -> V2 Database Schema Blueprint
-- Prepared for Supabase PostgreSQL with Row Level Security (RLS)

create extension if not exists "pgcrypto";

create type user_role as enum ('super_admin', 'distributor', 'retailer');
create type account_status as enum ('active', 'suspended', 'inactive');
create type kyc_status as enum ('verified', 'under_review', 'pending', 'rejected');
create type service_type as enum ('AEPS', 'DMT', 'CASH_DEPOSIT', 'MICRO_ATM', 'BBPS', 'RECHARGE');
create type txn_status as enum ('success', 'pending', 'failed');
create type ledger_direction as enum ('credit', 'debit');

-- 1. User Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'retailer',
  full_name text not null,
  email text not null unique,
  phone text not null,
  status account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Distributors
create table if not exists public.distributors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  distributor_code text not null unique,
  business_name text not null,
  region text not null,
  city text not null,
  state text not null,
  status account_status not null default 'active',
  created_at timestamptz not null default now()
);

-- 3. Retailers
create table if not exists public.retailers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  distributor_id uuid references public.distributors(id) on delete set null,
  retailer_code text not null unique,
  outlet_name text not null,
  owner_name text not null,
  mobile text not null,
  email text not null,
  city text not null,
  state text not null,
  pan_number text,
  aadhaar_last4 text,
  gst_number text,
  kyc_status kyc_status not null default 'pending',
  status account_status not null default 'active',
  created_at timestamptz not null default now()
);

-- 4. Wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null unique references public.retailers(id) on delete cascade,
  available_balance numeric(14,2) not null default 0.00 check (available_balance >= 0),
  lien_balance numeric(14,2) not null default 0.00 check (lien_balance >= 0),
  updated_at timestamptz not null default now()
);

-- 5. Wallet Ledger
create table if not exists public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  direction ledger_direction not null,
  amount numeric(14,2) not null check (amount > 0),
  balance_after numeric(14,2) not null,
  reference_no text not null,
  narration text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 6. Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  txn_ref text not null unique,
  utr_number text,
  retailer_id uuid not null references public.retailers(id),
  service service_type not null,
  sub_type text,
  customer_identifier text,
  bank_name text,
  amount numeric(14,2) not null check (amount >= 0),
  fee numeric(10,2) not null default 0.00,
  commission numeric(10,2) not null default 0.00,
  status txn_status not null default 'pending',
  provider_name text,
  failure_reason text,
  created_at timestamptz not null default now()
);

-- 7. Commission Slabs
create table if not exists public.commission_slabs (
  id uuid primary key default gen_random_uuid(),
  service service_type not null,
  slab_name text not null,
  min_amount numeric(14,2) not null,
  max_amount numeric(14,2) not null,
  rate_type text not null check (rate_type in ('flat', 'percentage')),
  retailer_rate numeric(8,4) not null,
  distributor_rate numeric(8,4) not null default 0,
  platform_margin numeric(8,4) not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 8. Settlements
create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  settlement_ref text not null unique,
  retailer_id uuid not null references public.retailers(id),
  amount numeric(14,2) not null check (amount > 0),
  bank_name text not null,
  account_last4 text not null,
  ifsc_code text not null,
  settlement_mode text not null default 'IMPS',
  status text not null check (status in ('pending', 'processing', 'settled', 'rejected')),
  utr_number text,
  requested_at timestamptz not null default now(),
  settled_at timestamptz
);

-- 9. Support Tickets & Audit Logs
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique,
  retailer_id uuid references public.retailers(id),
  txn_ref text,
  category text not null,
  subject text not null,
  description text not null,
  priority text not null default 'medium',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  actor_name text not null,
  actor_role user_role not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.distributors enable row level security;
alter table public.retailers enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.transactions enable row level security;
alter table public.commission_slabs enable row level security;
alter table public.settlements enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_logs enable row level security;

-- Helper function for RLS role check
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Baseline RLS policies (Super Admin full read/write; Retailer scoped to own records)
create policy "super_admin_all_retailers" on public.retailers
  for all using (public.is_super_admin());

create policy "retailer_view_own" on public.retailers
  for select using (profile_id = auth.uid());

create policy "super_admin_all_transactions" on public.transactions
  for all using (public.is_super_admin());

create policy "retailer_view_own_transactions" on public.transactions
  for select using (
    retailer_id in (select id from public.retailers where profile_id = auth.uid())
  );
