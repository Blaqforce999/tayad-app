import { calculateStreakUpdate, todayDateString } from './streak';
import { supabase } from './supabase';
import type { StreakState } from './types';

type StreakRow = {
  current_count: number;
  longest_count: number;
  last_log_date: string | null;
  forgiveness_used: boolean;
};

function toState(row: StreakRow): StreakState {
  return {
    count: row.current_count,
    longest: row.longest_count,
    forgivenessUsed: row.forgiveness_used,
    lastLogDate: row.last_log_date,
  };
}

const EMPTY_STREAK: StreakState = {
  count: 0,
  longest: 0,
  forgivenessUsed: false,
  lastLogDate: null,
};

export async function fetchStreak(): Promise<StreakState> {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_count, longest_count, last_log_date, forgiveness_used')
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data ? toState(data as StreakRow) : EMPTY_STREAK;
}

// Applies today's check-in to the streak. Idempotent — logging twice in one day
// leaves the count unchanged. Returns the new state.
export async function recordStreakCheckIn(): Promise<StreakState> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) {
    throw new Error('Not signed in.');
  }

  const current = await fetchStreak();
  const next = calculateStreakUpdate(current, todayDateString());

  const { error } = await supabase
    .from('streaks')
    .update({
      current_count: next.count,
      longest_count: next.longest,
      last_log_date: next.lastLogDate,
      forgiveness_used: next.forgivenessUsed,
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return next;
}
