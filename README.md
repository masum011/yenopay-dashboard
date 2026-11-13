# YenoPay Monorepo — Dashboards (V1)

Monorepo built with **pnpm Workspaces**, **React**, **Vite**, **JavaScript (ES6+ / JSX)**, **Tailwind CSS**, **React Router DOM**, **Recharts**, and **Lucide React**, structured for independent **Netlify** deployments and future **Supabase** integration.

## Workspace Structure

```text
yenopay-platform/
├── apps/
│   ├── super-admin/        # Super Admin Platform Management Dashboard
│   └── retailer/           # Retailer Banking & Financial Services Dashboard
├── packages/
│   ├── shared-ui/          # Reusable UI primitives (@yenopay/shared-ui)
│   └── shared-utils/       # Formatters, validators, CSV export, Supabase adapter
└── supabase/
    ├── migrations/         # PostgreSQL schema & RLS policies
    └── functions/          # Server-side banking proxy Edge Function skeleton
```

## Development Commands

```bash
# Install workspace dependencies
pnpm install

# Run Super Admin Dashboard independently
pnpm --filter @yenopay/super-admin dev

# Run Retailer Dashboard independently
pnpm --filter @yenopay/retailer dev

# Build both apps independently
pnpm --filter @yenopay/super-admin build
pnpm --filter @yenopay/retailer build
```

## Independent Netlify Deployment

Each application ships with its own `netlify.toml` and SPA redirect rules:
- **Super Admin Site**: Base directory `apps/super-admin` (or root build `pnpm --filter @yenopay/super-admin build`), publish `apps/super-admin/dist`.
- **Retailer Site**: Base directory `apps/retailer` (or root build `pnpm --filter @yenopay/retailer build`), publish `apps/retailer/dist`.
