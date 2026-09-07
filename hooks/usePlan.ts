import { useContext } from 'react';

import { PlanContext } from '@/contexts/PlanContext';

export function usePlan() {
  const context = useContext(PlanContext);

  if (context === undefined) {
    throw new Error('usePlan must be used inside a <PlanProvider>.');
  }

  return context;
}
