import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button } from './Button.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { LoginScreen } from './LoginScreen.jsx';

const AuthContext = createContext(null);

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function AuthStatusScreen({ portalLabel, message, onSignOut }) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const handleSignOut = async () => {
    setSignOutError('');
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (error) {
      setSignOutError(getErrorMessage(error, 'Unable to sign out.'));
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <h1 className="font-display text-xl font-bold text-slate-900">
          {portalLabel} access
        </h1>
        <p className="mt-3 text-sm text-slate-600" role="alert">
          {message}
        </p>
        {signOutError && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {signOutError}
          </p>
        )}
        <Button
          variant="secondary"
          className="mt-6"
          onClick={handleSignOut}
          loading={isSigningOut}
          disabled={isSigningOut}
        >
          Sign out
        </Button>
      </section>
    </main>
  );
}

export function SupabaseAuthProvider({
  client,
  requiredRole,
  portalLabel,
  children,
}) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!client) {
      setSessionLoading(false);
      return undefined;
    }

    let active = true;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setSignInError('');
      setProfileError('');
      setProfile(null);
      setProfileLoading(Boolean(nextSession));
      setSessionLoading(false);
    });

    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setSignInError(error.message);
          setSession(null);
        } else {
          setSession(data.session);
        }
      })
      .catch((error) => {
        if (active) {
          setSignInError(
            getErrorMessage(error, 'Unable to restore your Supabase session.')
          );
          setSession(null);
        }
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!client || sessionLoading || !session) {
      setProfile(null);
      setProfileError('');
      setProfileLoading(false);
      return undefined;
    }

    let active = true;
    setProfile(null);
    setProfileError('');
    setProfileLoading(true);

    const loadProfile = async () => {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('id, role, full_name, email, phone, status')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          throw new Error(
            'No profile is linked to this account. Ask an administrator to provision your profile.'
          );
        }
        if (active) setProfile(data);
      } catch (error) {
        if (active) {
          setProfileError(
            getErrorMessage(error, 'Unable to load your user profile.')
          );
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [client, session, sessionLoading]);

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!client) return;
      setSignInError('');
      setIsSigningIn(true);
      try {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } catch (error) {
        setSignInError(getErrorMessage(error, 'Unable to sign in.'));
      } finally {
        setIsSigningIn(false);
      }
    },
    [client]
  );

  const signOut = useCallback(async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }, [client]);
  const authValue = useMemo(
    () => ({ session, profile, signOut }),
    [session, profile, signOut]
  );

  if (!client) {
    return (
      <LoginScreen
        portalLabel={portalLabel}
        disabled
        error="Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for this app."
      />
    );
  }

  if (
    sessionLoading ||
    (session && (profileLoading || (!profile && !profileError)))
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label={`Checking ${portalLabel} access...`} />
      </main>
    );
  }

  if (!session) {
    return (
      <LoginScreen
        portalLabel={portalLabel}
        onSubmit={signIn}
        error={signInError}
        isSubmitting={isSigningIn}
      />
    );
  }

  const accessError =
    profileError ||
    (profile && profile.role !== requiredRole
      ? 'This account does not have permission to access this dashboard.'
      : profile && profile.status !== 'active'
      ? `This account is ${profile.status}. Contact your administrator.`
      : '');

  if (accessError || !profile) {
    return (
      <AuthStatusScreen
        portalLabel={portalLabel}
        message={accessError || 'Unable to load your user profile.'}
        onSignOut={signOut}
      />
    );
  }

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used inside SupabaseAuthProvider');
  }
  return auth;
}
