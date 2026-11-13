import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { BrandLogo, Button } from '@yenopay/shared-ui';
import { SuperAdminApp } from '@super-admin/App.jsx';
import { RetailerApp } from '@retailer/App.jsx';

function WorkspaceGateway() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
          <BrandLogo variant="light" />
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => navigate('/super-admin')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => navigate('/retailer')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Retailer Portal
            </button>
          </nav>
          <Button
            variant="navy"
            size="sm"
            onClick={() => navigate('/super-admin')}
          >
            Open Admin
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-teal-700">
              YenoPay Monorepo Workspace · V1 Dashboards
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Select a YenoPay Dashboard Application
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Both applications are built as independent Vite + React + JSX packages sharing unified UI primitives and prepared for separate Netlify deployments and Supabase integration.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Super Admin Card */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B192C] text-cyan-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-slate-900">
                  Super Admin Dashboard
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Complete platform governance: retailer onboarding & KYC, distributor hierarchies, transaction monitoring, wallet adjustments, commission slabs, settlements, and banking API routing.
                </p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>12 Modules</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">apps/super-admin</span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <Button
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/super-admin')}
                >
                  Launch Super Admin
                </Button>
              </div>
            </div>

            {/* Retailer Card */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
                  <Store className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-slate-900">
                  Retailer Banking Dashboard
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Merchant banking counter for AEPS cash withdrawal & balance enquiry, Domestic Money Transfer (DMT), supported cash deposits, Micro ATM, BBPS bill payments, wallet loads, and receipts.
                </p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>13 Modules</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">apps/retailer</span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <Button
                  variant="navy"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/retailer')}
                >
                  Launch Retailer Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RootRouter() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<WorkspaceGateway />} />
      <Route
        path="/super-admin/*"
        element={
          <SuperAdminApp
            basePath="/super-admin"
            onSwitchPortal={() => navigate('/retailer')}
          />
        }
      />
      <Route
        path="/retailer/*"
        element={
          <RetailerApp
            basePath="/retailer"
            onSwitchPortal={() => navigate('/super-admin')}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RootRouter />
    </BrowserRouter>
  );
}
