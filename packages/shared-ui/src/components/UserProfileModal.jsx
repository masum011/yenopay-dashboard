import React, { useEffect, useState } from 'react';
import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';

export function UserProfileModal({
  open,
  onClose,
  onSignOut,
  profile,
  portalLabel,
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  useEffect(() => {
    if (open) setSignOutError('');
  }, [open]);

  const handleSignOut = async () => {
    setSignOutError('');
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : 'Unable to sign out.'
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const details = [
    { label: 'Name', value: profile?.full_name },
    { label: 'Email', value: profile?.email },
    { label: 'Phone', value: profile?.phone },
    {
      label: 'Role',
      value: profile?.role?.replace(/_/g, ' '),
    },
    { label: 'Account status', value: profile?.status },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Your profile"
      subtitle={portalLabel}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSigningOut}
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={handleSignOut}
            loading={isSigningOut}
            disabled={isSigningOut}
          >
            Log out
          </Button>
        </>
      }
    >
      <dl className="space-y-4">
        {details.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
          >
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="max-w-[65%] break-words text-right text-sm font-medium capitalize text-slate-900">
              {value || '—'}
            </dd>
          </div>
        ))}
      </dl>
      {signOutError && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {signOutError}
        </p>
      )}
    </Modal>
  );
}
