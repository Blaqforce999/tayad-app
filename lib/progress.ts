import { todayDateString } from './streak';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Progress-tab reads. Everything is user-scoped by RLS.
// ---------------------------------------------------------------------------

export type HistoryPlan = {
  id: string;
  title: string;
  author: string;
  date: string | null; // completed_at or start_date, ISO
};

export type ReadingHistory = {
  completed: HistoryPlan[];
  setAside: HistoryPlan[];
};

export type JournalEntry = {
  date: string; // log_date, "YYYY-MM-DD"
  text: string;
};

type PlanHistoryRow = {
  id: string;
  status: 'completed' | 'abandoned';
  start_date: string;
  completed_at: string | null;
  books: { title: string; author: string };
};

export async function fetchReadingHistory(): Promise<ReadingHistory> {
  const { data, error } = await supabase
    .from('reading_plans')
    .select('id, status, start_date, completed_at, books(title, author)')
    .in('status', ['completed', 'abandoned'])
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as PlanHistoryRow[];
  const toHistoryPlan = (row: PlanHistoryRow): HistoryPlan => ({
    id: row.id,
    title: row.books.title,
    author: row.books.author,
    date: row.status === 'completed' ? row.completed_at : row.start_date,
  });

  return {
    completed: rows.filter((r) => r.status === 'completed').map(toHistoryPlan),
    setAside: rows.filter((r) => r.status === 'abandoned').map(toHistoryPlan),
  };
}

export async function fetchBooksFinished(): Promise<number> {
  const { count, error } = await supabase
    .from('reading_plans')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'completed');

  if (error) {
    throw error;
  }
  return count ?? 0;
}

export async function fetchReflections(): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('log_date, reflection')
    .not('reflection', 'is', null)
    .order('log_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => typeof row.reflection === 'string' && row.reflection.trim().length > 0)
    .map((row) => ({ date: row.log_date as string, text: (row.reflection as string).trim() }));
}

// Rough week-over-week reading momentum: completed check-ins in the last 7 days
// vs the 7 before that. Returns null until there's a prior week to compare.
export async function fetchWeekTrend(dailyPages: number): Promise<number | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('log_date')
    .eq('completed', true)
    .order('log_date', { ascending: false })
    .limit(60);

  if (error) {
    throw error;
  }

  const today = new Date(todayDateString());
  const dayMs = 24 * 60 * 60 * 1000;
  const inWindow = (iso: string, startDaysAgo: number, endDaysAgo: number) => {
    const d = new Date(iso).getTime();
    return d > today.getTime() - startDaysAgo * dayMs && d <= today.getTime() - endDaysAgo * dayMs;
  };

  const thisWeek = (data ?? []).filter((r) => inWindow(r.log_date as string, 7, 0)).length;
  const lastWeek = (data ?? []).filter((r) => inWindow(r.log_date as string, 14, 7)).length;

  if (lastWeek === 0) {
    return null;
  }
  const thisPages = thisWeek * dailyPages;
  const lastPages = lastWeek * dailyPages;
  return Math.round(((thisPages - lastPages) / lastPages) * 100);
}

export function formatShortDate(iso: string | null): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}
