import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Settings-tab reads/writes.
// ---------------------------------------------------------------------------

export type Profile = {
  email: string;
  displayName: string | null;
  notificationTime: string; // "HH:MM"
  createdAt: string;
};

export async function fetchProfile(): Promise<Profile> {
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ?? '';

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, notification_time, created_at')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    email,
    displayName: data?.display_name ?? null,
    notificationTime: data?.notification_time ?? '20:00',
    createdAt: data?.created_at ?? new Date().toISOString(),
  };
}

export async function updateNotificationTime(hhmm: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('Not signed in.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ notification_time: hhmm })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export type DeletionSummary = {
  problems: number;
  booksFinished: number;
  reflections: number;
  streak: number;
};

// The counts shown on the "Delete everything?" confirmation.
export async function fetchDeletionSummary(): Promise<DeletionSummary> {
  const [problems, booksFinished, reflections, streak] = await Promise.all([
    supabase.from('recommendations').select('id', { count: 'exact', head: true }),
    supabase
      .from('reading_plans')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed'),
    supabase
      .from('daily_logs')
      .select('id', { count: 'exact', head: true })
      .not('reflection', 'is', null),
    supabase.from('streaks').select('current_count').maybeSingle(),
  ]);

  return {
    problems: problems.count ?? 0,
    booksFinished: booksFinished.count ?? 0,
    reflections: reflections.count ?? 0,
    streak: (streak.data?.current_count as number | undefined) ?? 0,
  };
}

// Gathers everything the user has stored, for the "Export my data" action.
export async function buildDataExport(): Promise<string> {
  const [profile, recs, plans, logs] = await Promise.all([
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('recommendations').select('problem_text, created_at'),
    supabase
      .from('reading_plans')
      .select('status, total_pages, daily_pages, start_date, completed_at, books(title, author)'),
    supabase.from('daily_logs').select('log_date, pages_read, reflection, completed'),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profile.data ?? null,
    problems: recs.data ?? [],
    readingPlans: plans.data ?? [],
    dailyLogs: logs.data ?? [],
  };

  return JSON.stringify(payload, null, 2);
}

export function formatMemberSince(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `Since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

// The four quick-pick reminder times from the Figma.
export const REMINDER_OPTIONS = [
  { label: '7 AM', value: '07:00' },
  { label: '1 PM', value: '13:00' },
  { label: '8 PM', value: '20:00' },
  { label: '10 PM', value: '22:00' },
] as const;

export function formatReminderTime(hhmm: string): { time: string; period: string } {
  const [hStr, mStr] = hhmm.split(':');
  const hour = Number(hStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return { time: `${displayHour}:${mStr}`, period };
}
