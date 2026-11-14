import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import logoImage from '../assets/yenopay-logo-tm.png';
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';

export function LoginScreen({
  portalLabel,
  onSubmit,
  error,
  isSubmitting = false,
  disabled = false,
  requirePrivacyPolicy = false,
  onResetPassword,
  supportContact,
  compactLogin = false,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const loginTitle = `${portalLabel.replace(/\s+Portal$/, '')} Login`;

  const handlePasswordReset = async () => {
    setResetError('');
    setResetMessage('');
    if (!email.trim()) {
      setResetError('Enter your email address above to receive a reset link.');
      return;
    }

    setIsSendingReset(true);
    try {
      await onResetPassword(email.trim());
      setResetMessage(
        'If an account exists for that email, a password reset link has been sent.'
      );
    } catch (error) {
      setResetError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to send a password reset link.'
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled || !onSubmit || (requirePrivacyPolicy && !acceptedPrivacyPolicy)) {
      return;
    }
    await onSubmit({ email: email.trim(), password });
  };

  return (
    <main
      className={`flex min-h-screen items-center justify-center bg-slate-50 px-4 ${
        compactLogin ? 'py-4' : 'py-10'
      }`}
    >
      <section
        className={`w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${
          compactLogin ? '-translate-y-2.5 pt-[5px]' : ''
        }`}
      >
        <div
          className={`border-b border-slate-100 px-8 ${
            compactLogin ? 'py-3' : 'py-6'
          }`}
        >
          <img
            src={logoImage}
            alt="YenoPay"
            className={`mx-auto block h-auto max-w-full object-contain ${
              compactLogin ? 'w-48' : 'w-64'
            }`}
          />
          <h1
            className={`font-display font-bold tracking-tight text-slate-900 ${
              compactLogin ? 'mt-3 text-xl' : 'mt-7 text-2xl'
            }`}
          >
            {loginTitle}
          </h1>
          {!compactLogin && (
            <p className="mt-1 text-sm text-slate-500">
              Use your registered account to access the dashboard.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`px-8 ${
            compactLogin ? 'space-y-3 py-4' : 'space-y-5 py-6'
          }`}
        >
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

          {onResetPassword && (
            <div className="-mt-3 flex justify-end">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={disabled || isSubmitting || isSendingReset}
                className="text-sm font-medium text-brand-purple-700 hover:text-brand-purple-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingReset ? 'Sending reset link...' : 'Forgot password?'}
              </button>
            </div>
          )}

          {resetError && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {resetError}
            </p>
          )}

          {resetMessage && (
            <p
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              role="status"
            >
              {resetMessage}
            </p>
          )}

          {requirePrivacyPolicy && (
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                required
                checked={acceptedPrivacyPolicy}
                onChange={(event) => setAcceptedPrivacyPolicy(event.target.checked)}
                disabled={disabled || isSubmitting}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-purple-700 focus:ring-brand-purple-600"
              />
              <span>I have read and agree to the Privacy Policy.</span>
            </label>
          )}

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
            style={
              compactLogin
                ? { height: '50px', paddingTop: '5px', paddingBottom: '5px' }
                : undefined
            }
            loading={isSubmitting}
            disabled={
              disabled ||
              isSubmitting ||
              !email ||
              !password ||
              (requirePrivacyPolicy && !acceptedPrivacyPolicy)
            }
          >
            Sign in
          </Button>
        </form>

        {supportContact && (
          <div className="border-t border-slate-100 bg-slate-50 px-8 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Support &amp; Service
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              <a
                href={`tel:${supportContact.phone}`}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-purple-800"
              >
                <Phone aria-hidden="true" className="h-4 w-4" />
                {supportContact.phone}
              </a>
              <a
                href={`mailto:${supportContact.email}`}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-purple-800"
              >
                <Mail aria-hidden="true" className="h-4 w-4" />
                {supportContact.email}
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
