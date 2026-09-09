import { resolveSources } from './books';
import type { CatalogueBook } from './catalogue';
import { planTotalDays } from './plan';
import { todayDateString } from './streak';
import { supabase } from './supabase';
import type { BookSources, Recommendation } from './types';

// ---------------------------------------------------------------------------
// Types (kept close to use; DB rows are snake_case)
// ---------------------------------------------------------------------------

export type PlanStatus = 'active' | 'completed' | 'abandoned';

export type ActivePlan = {
  id: string;
  bookId: string;
  book: CatalogueBook;
  sources: BookSources;
  recommendationId: string | null;
  chosenRank: number;
  totalPages: number;
  dailyPages: number;
  targetDays: number;
  startDate: string;
  status: PlanStatus;
  pagesRead: number;
  checkedInToday: boolean;
};

type BookRow = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  page_count: number;
  cover_url: string | null;
  description: string | null;
  free_source_url: string | null;
  amazon_url: string | null;
  google_play_url: string | null;
  kobo_url: string | null;
  problem_tags: string[];
};

type PlanRow = {
  id: string;
  book_id: string;
  recommendation_id: string | null;
  chosen_rank: number;
  total_pages: number;
  daily_pages: number;
  target_days: number;
  start_date: string;
  status: PlanStatus;
  books: BookRow;
};

function bookRowToBook(row: BookRow): CatalogueBook {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.title,
    author: row.author,
    pageCount: row.page_count,
    tags: row.problem_tags ?? [],
    coverUrl: row.cover_url ?? undefined,
    description: row.description ?? undefined,
    hasFreeSource: Boolean(row.free_source_url),
    freeSourceUrl: row.free_source_url ?? undefined,
    amazonUrl: row.amazon_url ?? undefined,
    googlePlayUrl: row.google_play_url ?? undefined,
    koboUrl: row.kobo_url ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchActivePlan(): Promise<ActivePlan | null> {
  const { data, error } = await supabase
    .from('reading_plans')
    .select('*, books(*)')
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const row = data as PlanRow;

  const { data: logs, error: logsError } = await supabase
    .from('daily_logs')
    .select('log_date, pages_read, completed')
    .eq('plan_id', row.id)
    .order('log_date', { ascending: false });

  if (logsError) {
    throw logsError;
  }

  const pagesRead = (logs ?? []).reduce(
    (max, log) => Math.max(max, log.pages_read ?? 0),
    0,
  );
  const checkedInToday = (logs ?? []).some(
    (log) => log.log_date === todayDateString() && log.completed,
  );

  const book = bookRowToBook(row.books);

  return {
    id: row.id,
    bookId: row.book_id,
    book,
    sources: resolveSources(book),
    recommendationId: row.recommendation_id,
    chosenRank: row.chosen_rank,
    totalPages: row.total_pages,
    dailyPages: row.daily_pages,
    targetDays: row.target_days,
    startDate: row.start_date,
    status: row.status,
    pagesRead,
    checkedInToday,
  };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

// Persists the problem and the three ranked picks. Returns the recommendation id.
export async function saveRecommendation(
  problemText: string,
  picks: Recommendation[],
): Promise<string> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) {
    throw new Error('Not signed in.');
  }

  const { data: rec, error: recError } = await supabase
    .from('recommendations')
    .insert({ user_id: userId, problem_text: problemText })
    .select('id')
    .single();

  if (recError) {
    throw recError;
  }

  const recommendationId = rec.id as string;

  const { error: itemsError } = await supabase.from('recommendation_items').insert(
    picks.map((pick) => ({
      recommendation_id: recommendationId,
      book_id: pick.book.id,
      rank: pick.rank,
      explanation: pick.explanation,
    })),
  );

  if (itemsError) {
    throw itemsError;
  }

  return recommendationId;
}

export async function startPlan(input: {
  bookId: string;
  recommendationId: string | null;
  chosenRank: number;
  totalPages: number;
  dailyPages: number;
}): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) {
    throw new Error('Not signed in.');
  }

  const { error } = await supabase.from('reading_plans').insert({
    user_id: userId,
    book_id: input.bookId,
    recommendation_id: input.recommendationId,
    chosen_rank: input.chosenRank,
    total_pages: input.totalPages,
    daily_pages: input.dailyPages,
    target_days: planTotalDays(input.totalPages, input.dailyPages),
  });

  if (error) {
    throw error;
  }
}

// One check-in per plan per day (upsert on the plan_id/log_date unique index).
export async function checkInToday(input: {
  planId: string;
  pagesRead: number;
  reflection?: string;
}): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) {
    throw new Error('Not signed in.');
  }

  const { error } = await supabase.from('daily_logs').upsert(
    {
      user_id: userId,
      plan_id: input.planId,
      log_date: todayDateString(),
      pages_read: input.pagesRead,
      reflection: input.reflection ?? null,
      completed: true,
    },
    { onConflict: 'plan_id,log_date' },
  );

  if (error) {
    throw error;
  }
}

// Adds a reflection to today's existing log without touching pages_read.
export async function attachReflection(planId: string, reflection: string): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .update({ reflection })
    .eq('plan_id', planId)
    .eq('log_date', todayDateString());

  if (error) {
    throw error;
  }
}

export async function completePlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('reading_plans')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', planId);

  if (error) {
    throw error;
  }
}

// Sets today's page number exactly, rather than assuming a full daily goal was
// read. Upserts today's log so it works whether or not they checked in already.
export async function setPagesRead(planId: string, pagesRead: number): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) {
    throw new Error('Not signed in.');
  }

  const { error } = await supabase.from('daily_logs').upsert(
    {
      user_id: userId,
      plan_id: planId,
      log_date: todayDateString(),
      pages_read: pagesRead,
    },
    { onConflict: 'plan_id,log_date' },
  );

  if (error) {
    throw error;
  }
}

// Changes the daily goal on an active plan and re-derives how many days are left.
export async function updateDailyPages(
  planId: string,
  dailyPages: number,
  totalPages: number,
): Promise<void> {
  const { error } = await supabase
    .from('reading_plans')
    .update({ daily_pages: dailyPages, target_days: planTotalDays(totalPages, dailyPages) })
    .eq('id', planId);

  if (error) {
    throw error;
  }
}
