import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchStreak } from '@/lib/streaks';
import type { StreakState } from '@/lib/types';

import { useAuth } from '@/hooks/useAuth';

type StreakContextValue = {
  streak: StreakState;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const EMPTY: StreakState = { count: 0, longest: 0, forgivenessUsed: false, lastLogDate: null };

export const StreakContext = createContext<StreakContextValue | undefined>(undefined);

export function StreakProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakState>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setStreak(EMPTY);
      setIsLoading(false);
      return;
    }
    try {
      setStreak(await fetchStreak());
    } catch {
      // Streak display is calculated locally; a stale/absent value is never fatal.
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    void refresh();
  }, [refresh]);

  const value = useMemo<StreakContextValue>(
    () => ({ streak, isLoading, refresh }),
    [streak, isLoading, refresh],
  );

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}
