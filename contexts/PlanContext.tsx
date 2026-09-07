import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchActivePlan, type ActivePlan } from '@/lib/plans';

import { useAuth } from '@/hooks/useAuth';

type PlanContextValue = {
  plan: ActivePlan | null;
  isLoading: boolean;
  // Re-fetch after a write (starting a plan, a daily check-in, completion).
  refresh: () => Promise<void>;
};

export const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setPlan(null);
      setIsLoading(false);
      return;
    }
    try {
      setPlan(await fetchActivePlan());
    } catch {
      // A read failure shouldn't wedge the app — treat it as "no plan".
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    void refresh();
  }, [refresh]);

  const value = useMemo<PlanContextValue>(
    () => ({ plan, isLoading, refresh }),
    [plan, isLoading, refresh],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
