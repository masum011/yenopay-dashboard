import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Network,
  ArrowLeftRight,
  Wallet,
  Percent,
  Landmark,
  BarChart3,
  ServerCog,
  LifeBuoy,
  ShieldCheck,
  Settings,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { BrandLogo } from '@yenopay/shared-ui';

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { to: '.', end: true, label: 'Overview', icon: LayoutDashboard },
      { to: 'retailers', label: 'Retailers', icon: Store },
      { to: 'distributors', label: 'Distributors', icon: Network },
    ],
  },
  {
    label: 'Finance & Ledger',
    items: [
      { to: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
      { to: 'wallets', label: 'Wallets', icon: Wallet },
      { to: 'commissions', label: 'Commissions', icon: Percent },
      { to: 'settlements', label: 'Settlements', icon: Landmark },
      { to: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Platform & Governance',
    items: [
      { to: 'api-providers', label: 'API Providers', icon: ServerCog },
      { to: 'support', label: 'Support Tickets', icon: LifeBuoy },
      { to: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
      { to: 'settings', label: 'Admin Settings', icon: Settings },
    ],
  },
];

const ROUTE_TITLES = {
  '': 'Platform Overview',
  retailers: 'Retailer Management',
  distributors: 'Distributor Network',
  transactions: 'Transaction Monitoring',
  wallets: 'Wallet Management',
  commissions: 'Commission Configuration',
  settlements: 'Settlement Management',
  reports: 'Reports & Analytics',
  'api-providers': 'Banking API Providers',
  support: 'Support & Complaints',
  'audit-logs': 'Audit Logs',
  settings: 'Admin Settings',
};

export function AdminLayout({ basePath = '', onSwitchPortal }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const normalizedSubpath = location.pathname
    .replace(basePath, '')
    .replace(/^\/+|\/+$/g, '');
  const currentTitle = ROUTE_TITLES[normalizedSubpath] || 'Super Admin';

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#3F2066] text-slate-300">
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
        <BrandLogo variant="dark" portalLabel="Super Admin" />
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
              {group.label}
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
                      `flex w-full items-center gap-3 px-3 py-1.5 text-sm leading-4 font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-brand-gold-500 text-brand-purple-950 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate py-1">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-cyan-300">
            VM
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              Vikramaditya Mehta
            </p>
            <p className="truncate text-[11px] text-slate-400">
              Chief Platform Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
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

      {/* Main Content Area */}
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
              <span className="hidden text-slate-400 sm:inline">Super Admin</span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="font-medium text-slate-900 truncate">
                {currentTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden text-xs text-slate-500 md:inline">
              YenoPay Operations · INR (₹)
            </span>
            {onSwitchPortal && (
              <button
                type="button"
                onClick={onSwitchPortal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Retailer Portal</span>
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
    </div>
  );
}
