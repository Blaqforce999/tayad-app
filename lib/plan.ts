// Pure reading-plan math. No Supabase, no dates from the network.

// Daily target rounds up so the last day is never overloaded.
export function planTotalDays(totalPages: number, dailyPages: number): number {
  if (dailyPages <= 0) {
    return 0;
  }
  return Math.ceil(totalPages / dailyPages);
}

// The 1-indexed page span for a given day of the plan.
export function pageRangeForDay(
  dayNumber: number,
  dailyPages: number,
  totalPages: number,
): { startPage: number; endPage: number } {
  const startPage = Math.min((dayNumber - 1) * dailyPages + 1, totalPages);
  const endPage = Math.min(dayNumber * dailyPages, totalPages);
  return { startPage, endPage };
}

export function pagesRemaining(pagesRead: number, totalPages: number): number {
  return Math.max(totalPages - pagesRead, 0);
}

// Days left at the plan's pace, from wherever the reader currently is.
export function daysRemaining(pagesRead: number, totalPages: number, dailyPages: number): number {
  return planTotalDays(pagesRemaining(pagesRead, totalPages), dailyPages);
}

// Bounds for the daily-goal stepper on the plan-setup screen.
export const MIN_DAILY_PAGES = 5;
export const MAX_DAILY_PAGES = 100;
export const DAILY_PAGES_STEP = 5;
export const DEFAULT_DAILY_PAGES = 15;

export function clampDailyPages(value: number): number {
  return Math.min(Math.max(value, MIN_DAILY_PAGES), MAX_DAILY_PAGES);
}
