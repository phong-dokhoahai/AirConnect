import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Session, User } from '@supabase/supabase-js';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const AUTH_REDIRECT_PATH = 'auth/callback';
const AUTH_REDIRECT_NATIVE = `airconnect://${AUTH_REDIRECT_PATH}`;
const exchangedAuthCodes = new Set<string>();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  signingIn: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<Session | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getRedirectTo() {
  return makeRedirectUri({
    scheme: 'airconnect',
    native: AUTH_REDIRECT_NATIVE,
    path: AUTH_REDIRECT_PATH,
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function getOAuthCallbackCode(callbackUrl: string) {
  const url = new URL(callbackUrl);

  return getOAuthCallbackCodeFromParams(url.searchParams);
}

export function getOAuthCallbackCodeFromParams(params: URLSearchParams) {
  const error = params.get('error_description') ?? params.get('error');

  if (error) {
    throw new Error(error);
  }

  const code = params.get('code');

  if (!code) {
    throw new Error('Google did not return an authorization code.');
  }

  return code;
}

export async function exchangeOAuthCallbackCode(code: string) {
  if (exchangedAuthCodes.has(code)) {
    return null;
  }

  exchangedAuthCodes.add(code);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    exchangedAuthCodes.delete(code);
    throw error;
  }

  return data.session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data.session);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setInitializing(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true);
    setError(null);

    try {
      const redirectTo = getRedirectTo();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (!data.url) {
        throw new Error('Google sign in could not be started.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        const authCode = getOAuthCallbackCode(result.url);
        const nextSession = await exchangeOAuthCallbackCode(authCode);

        if (nextSession) {
          setSession(nextSession);
        }

        return nextSession;
      }

      return null;
    } catch (authError) {
      setError(getErrorMessage(authError));
      return null;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      initializing,
      signingIn,
      error,
      signInWithGoogle,
      signOut,
      clearError,
    }),
    [
      session,
      initializing,
      signingIn,
      error,
      signInWithGoogle,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
