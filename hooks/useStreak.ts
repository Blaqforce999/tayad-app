import { useContext } from 'react';

import { StreakContext } from '@/contexts/StreakContext';

export function useStreak() {
  const context = useContext(StreakContext);

  if (context === undefined) {
    throw new Error('useStreak must be used inside a <StreakProvider>.');
  }

  return context;
}
