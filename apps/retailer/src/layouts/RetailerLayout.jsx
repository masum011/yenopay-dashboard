import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Fingerprint,
  Send,
  Banknote,
  CreditCard,
  ReceiptText,
  Wallet,
  ArrowLeftRight,
  Percent,
  UserCheck,
  LifeBuoy,
  Bell,
  Settings,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
import {
  BrandLogo,
  UserProfileModal,
  useAuth,
} from '@yenopay/shared-ui';
import { formatINR, getInitials } from '@yenopay/shared-utils';
import { useRetailerStore } from '../hooks/useRetailerStore.jsx';

const NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [
      { to: '.', end: true, label: 'Overview', icon: LayoutDashboard },
    ],
  },
  {
    items: [
      { to: 'aeps', label: 'AEPS', icon: Fingerprint },
      { to: 'dmt', label: 'Money Transfer', icon: Send },
      { to: 'cash-deposit', label: 'Cash Deposit', icon: Banknote },
      { to: 'micro-atm', label: 'Micro ATM', icon: CreditCard },
    ],
  },
  {
    label: 'Bills & Recharges',
    items: [
      { to: 'bill-payments', label: 'BBPS & Recharges', icon: ReceiptText },
    ],
  },
  {
    label: 'Wallet & Ledger',
    items: [
      { to: 'wallet', label: 'Wallet Management', icon: Wallet },
      { to: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
      { to: 'commissions', label: 'Commissions', icon: Percent },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: 'profile-kyc', label: 'Profile & KYC', icon: UserCheck },
      { to: 'support', label: 'Support Tickets', icon: LifeBuoy },
      { to: 'notifications', label: 'Notifications', icon: Bell },
      { to: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const ROUTE_TITLES = {
  '': 'Retailer Overview',
  aeps: 'AEPS Banking',
  dmt: 'Money Transfer (DMT)',
  'cash-deposit': 'Cash Deposit',
  'micro-atm': 'Micro ATM',
  'bill-payments': 'BBPS & Recharges',
  wallet: 'Wallet Management',
  transactions: 'Transaction History',
  commissions: 'Commission Earnings',
  'profile-kyc': 'Profile & KYC',
  support: 'Support Tickets',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function RetailerLayout({ basePath = '', onSwitchPortal }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet, overviewStats } = useRetailerStore();
  const { profile: userProfile, signOut } = useAuth();

  const normalizedSubpath = location.pathname
    .replace(basePath, '')
    .replace(/^\/+|\/+$/g, '');
  const currentTitle = ROUTE_TITLES[normalizedSubpath] || 'Retailer Portal';

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#3F2066] text-slate-300">
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
        <BrandLogo variant="dark" portalLabel="Retailer Portal" />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-hidden px-3 py-3 space-y-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-xs font-semibold tracking-wider text-slate-300/80">
              {/* {group.label} */}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm leading-4 font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-brand-gold-500 text-brand-purple-950 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate py-1">{item.label}</span>
                    </span>
                    {item.to === 'notifications' &&
                      overviewStats.unreadNotifications > 0 && (
                        <span className="font-mono text-[11px] font-semibold text-cyan-300 tabular-nums">
                          {overviewStats.unreadNotifications}
                        </span>
                      )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800/80 p-4">
        <button
          type="button"
          onClick={() => setProfileModalOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Open profile"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-cyan-300">
            {getInitials(userProfile.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {userProfile.full_name}
            </p>
            <p className="truncate font-mono text-[11px] text-slate-400">
              {userProfile.email}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-64 max-w-[80vw]">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden text-slate-400 sm:inline">Retailer</span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="font-medium text-slate-900 truncate">
                {currentTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('wallet')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs hover:border-cyan-300 hover:bg-cyan-50/40 transition-colors cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5 text-teal-700" />
              <span className="hidden text-slate-500 sm:inline">Wallet:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatINR(wallet.availableBalance)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('notifications')}
              className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {overviewStats.unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                  {overviewStats.unreadNotifications}
                </span>
              )}
            </button>

            {onSwitchPortal && (
              <button
                type="button"
                onClick={onSwitchPortal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Super Admin</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-600" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSignOut={signOut}
        profile={userProfile}
        portalLabel="Retailer Portal"
      />
    </div>
  );
}
