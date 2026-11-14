import React, { useState } from 'react';
import logoImage from '../assets/yenopay-logo-tm.png';
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';

export function PasswordRecoveryScreen({ onSubmit, onContinue }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(password);
      setIsUpdated(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message
          ? submitError.message
          : 'Unable to update your password.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
            {isUpdated ? 'Password updated' : 'Set a new password'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isUpdated
              ? 'Your password has been changed successfully.'
              : 'Choose a new password for your YenoPay account.'}
          </p>
        </div>

        {isUpdated ? (
          <div className="px-8 py-6">
            <Button className="w-full" onClick={onContinue}>
              Continue
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-8 py-6">
            <Input
              id="new-password"
              name="new-password"
              type="password"
              label="New password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              id="confirm-new-password"
              name="confirm-new-password"
              type="password"
              label="Confirm new password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            {error && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={
                isSubmitting || !password || !confirmPassword
              }
            >
              Update password
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
