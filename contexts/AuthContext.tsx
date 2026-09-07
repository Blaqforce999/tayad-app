import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Session } from '@supabase/supabase-js';

import { toAuthUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@/lib/types';

type AuthContextValue = {
  session: Session | null;
  user: AuthUser | null;
  // True until the first session check resolves. Screens wait on this before
  // deciding whether to show auth or the app.
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) {
        return;
      }
      setSession(data.session);
      setIsLoading(false);
    });

    // Fires on sign-in, sign-out, and token refresh -- keeps the app in sync
    // without any screen having to re-check.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: toAuthUser(session?.user), isLoading }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
