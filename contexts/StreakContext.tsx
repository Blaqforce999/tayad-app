import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchStreak } from '@/lib/streaks';
import type { StreakState } from '@/lib/types';

import { useAuth } from '@/hooks/useAuth';

type StreakContextValue = {
  streak: StreakState;
  isLoading: boolean;
  // True when the last refresh failed. The streak value is kept (last-known-good).
  hasError: boolean;
  refresh: () => Promise<void>;
};

const EMPTY: StreakState = { count: 0, longest: 0, forgivenessUsed: false, lastLogDate: null };

export const StreakContext = createContext<StreakContextValue | undefined>(undefined);

export function StreakProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakState>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setStreak(EMPTY);
      setHasError(false);
      setIsLoading(false);
      return;
    }
    try {
      setStreak(await fetchStreak());
      setHasError(false);
    } catch {
      // Keep the last-known-good value — a stale count is far better than it
      // snapping to zero on a network blip.
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    void refresh();
  }, [refresh]);

  const value = useMemo<StreakContextValue>(
    () => ({ streak, isLoading, hasError, refresh }),
    [streak, isLoading, hasError, refresh],
  );

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}
