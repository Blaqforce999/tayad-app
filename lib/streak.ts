import type { StreakState } from './types';

// ---------------------------------------------------------------------------
// Streak calculation — pure functions, no Supabase.
// These run entirely in memory from the last known StreakState.
// ---------------------------------------------------------------------------

/**
 * Returns today's date as a "YYYY-MM-DD" string in the user's local timezone.
 * React Native does not have a server clock; we use the device clock.
 */
export function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the number of calendar days between two "YYYY-MM-DD" date strings.
 * Positive if dateB is after dateA.
 */
export function daysBetween(dateA: string, dateB: string): number {
  const msA = new Date(dateA).getTime();
  const msB = new Date(dateB).getTime();
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the new StreakState after the user completes today's check-in.
 *
 * Rules:
 * - If lastLogDate is null (first ever log): streak starts at 1.
 * - If lastLogDate is today: idempotent, no change (already logged today).
 * - If gap is 1 day (yesterday): consecutive, streak increments.
 * - If gap is 2 days and forgivenessUsed is false: forgiveness token consumed,
 *   streak is preserved, forgivenessUsed becomes true.
 * - If gap is 2 days and forgivenessUsed is true: streak broken, resets to 1,
 *   forgiveness resets.
 * - If gap > 2 days: streak broken, resets to 1, forgiveness resets.
 */
export function calculateStreakUpdate(
  current: StreakState,
  todayString: string,
): StreakState {
  const { count, longest, forgivenessUsed, lastLogDate } = current;

  // First ever log
  if (!lastLogDate) {
    return {
      count: 1,
      longest: Math.max(1, longest),
      forgivenessUsed: false,
      lastLogDate: todayString,
    };
  }

  const gap = daysBetween(lastLogDate, todayString);

  // Already logged today — idempotent
  if (gap === 0) {
    return current;
  }

  // Consecutive day
  if (gap === 1) {
    const newCount = count + 1;
    return {
      count: newCount,
      longest: Math.max(newCount, longest),
      forgivenessUsed,
      lastLogDate: todayString,
    };
  }

  // One missed day — forgiveness available
  if (gap === 2 && !forgivenessUsed) {
    const newCount = count + 1;
    return {
      count: newCount,
      longest: Math.max(newCount, longest),
      forgivenessUsed: true, // token consumed
      lastLogDate: todayString,
    };
  }

  // Streak broken — reset. Forgiveness also resets for the new streak.
  return {
    count: 1,
    longest: Math.max(1, longest),
    forgivenessUsed: false,
    lastLogDate: todayString,
  };
}

/**
 * Returns whether the streak badge should be visible.
 * Badge is hidden entirely when count is 0 — the absence is the signal.
 */
export function isStreakAlive(streak: StreakState): boolean {
  return streak.count > 0;
}

/**
 * Returns whether the forgiveness token is still available.
 * Used to show the "One free pass left" label on the streak badge.
 */
export function hasForgivenessAvailable(streak: StreakState): boolean {
  return !streak.forgivenessUsed;
}
