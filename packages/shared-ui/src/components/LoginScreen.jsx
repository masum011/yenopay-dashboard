import React, { useState } from 'react';
import logoImage from '../assets/yenopay-logo-tm.png';
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';

export function LoginScreen({
  portalLabel,
  onSubmit,
  error,
  isSubmitting = false,
  disabled = false,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginTitle = `${portalLabel.replace(/\s+Portal$/, '')} Login`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled || !onSubmit) return;
    await onSubmit({ email: email.trim(), password });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-8 py-6">
          <img
            src={logoImage}
            alt="YenoPay"
            className="mx-auto block h-auto w-64 max-w-full object-contain"
          />
          <h1 className="mt-7 font-display text-2xl font-bold tracking-tight text-slate-900">
            {loginTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Use your registered account to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-8 py-6">
          <Input
            id="login-email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="username"
            required
            disabled={disabled || isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
          <Input
            id="login-password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            disabled={disabled || isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />

          {error && (
            <p
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={disabled || isSubmitting || !email || !password}
          >
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
}
