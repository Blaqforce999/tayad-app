import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchActivePlan, type ActivePlan } from '@/lib/plans';

import { useAuth } from '@/hooks/useAuth';

type PlanContextValue = {
  plan: ActivePlan | null;
  isLoading: boolean;
  // True when the last refresh failed. The plan value is kept (last-known-good).
  hasError: boolean;
  // Re-fetch after a write (starting a plan, a daily check-in, completion).
  refresh: () => Promise<void>;
};

export const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setPlan(null);
      setHasError(false);
      setIsLoading(false);
      return;
    }
    try {
      // fetchActivePlan() returns null legitimately when there is no active
      // plan; only a thrown error is a failure.
      setPlan(await fetchActivePlan());
      setHasError(false);
    } catch {
      // Keep the last-known-good plan. A network blip must not make the active
      // plan vanish from Home — surface `hasError` instead if a screen wants to.
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    void refresh();
  }, [refresh]);

  const value = useMemo<PlanContextValue>(
    () => ({ plan, isLoading, hasError, refresh }),
    [plan, isLoading, hasError, refresh],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
