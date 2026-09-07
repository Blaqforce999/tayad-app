-- Initial schema for Tayad AI.
--
-- Creates the seven core tables, enables Row Level Security on every one, and
-- writes all policies in this same migration -- RLS before data, always
-- (see .agents/rules/security.md and skills/supabase-schema).
--
-- There is no payment, subscription, order, or purchase table. Tayad has no
-- monetisation in V1. There is no table for crisis input: crisis text is never
-- stored, transmitted, or logged -- it stays on the device.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at honest on every UPDATE
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles -- extends auth.users with app-specific fields
-- ---------------------------------------------------------------------------

create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  notification_time text not null default '20:00',  -- HH:MM in the user's local time
  timezone          text not null default 'UTC',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "Users update own profile" on public.profiles
  for update using (id = auth.uid());
create policy "Users insert own profile" on public.profiles
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- books -- the shared, curated catalogue
-- Readable by every authenticated user. No insert/update/delete policy exists,
-- so only the service role can write it (catalogue management via seed or an
-- Edge Function).
-- ---------------------------------------------------------------------------

create table public.books (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  author          text not null,
  isbn            text not null unique,
  page_count      integer not null check (page_count > 0),
  cover_url       text,
  description     text,
  free_source_url text,   -- Project Gutenberg, Open Library, Standard Ebooks -- legal free sources only
  amazon_url      text,
  google_play_url text,
  kobo_url        text,
  problem_tags    text[] not null default '{}',  -- tags the match function reasons over
  created_at      timestamptz not null default now()
);

-- GIN index for tag-overlap lookups when padding AI picks with catalogue matches.
create index idx_books_tags on public.books using gin (problem_tags);

alter table public.books enable row level security;

create policy "Authenticated users read books" on public.books
  for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- recommendations -- one row per problem the user submits
-- problem_text is sensitive: the user's private admission. Never log it.
-- ---------------------------------------------------------------------------

create table public.recommendations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  problem_text text not null,
  created_at   timestamptz not null default now()
);

create index idx_recommendations_user on public.recommendations(user_id, created_at desc);

alter table public.recommendations enable row level security;

create policy "Users read own recommendations" on public.recommendations
  for select using (user_id = auth.uid());
create policy "Users insert own recommendations" on public.recommendations
  for insert with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- recommendation_items -- exactly three ranked books per recommendation
-- The unique (recommendation_id, rank) constraint enforces "one book per rank".
-- The client inserts all three in one transaction after the match returns.
-- ---------------------------------------------------------------------------

create table public.recommendation_items (
  id                uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  book_id           uuid not null references public.books(id),
  rank              integer not null check (rank in (1, 2, 3)),  -- 1 is the primary pick
  explanation       text not null,
  created_at        timestamptz not null default now(),
  unique (recommendation_id, rank)
);

create index idx_recommendation_items_rec on public.recommendation_items(recommendation_id, rank);

alter table public.recommendation_items enable row level security;

-- Access is gated through the parent recommendation's owner.
create policy "Users read own recommendation items" on public.recommendation_items
  for select using (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.user_id = auth.uid()
    )
  );
create policy "Users insert own recommendation items" on public.recommendation_items
  for insert with check (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- reading_plans -- the daily plan for whichever book the user chose
-- daily_pages is CEIL(total_pages / target_days), computed by the client.
-- ---------------------------------------------------------------------------

create table public.reading_plans (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  book_id           uuid not null references public.books(id),
  recommendation_id uuid references public.recommendations(id) on delete set null,
  chosen_rank       integer not null default 1 check (chosen_rank in (1, 2, 3)),
  total_pages       integer not null check (total_pages > 0),
  daily_pages       integer not null check (daily_pages > 0),
  target_days       integer not null check (target_days > 0),
  start_date        date not null default current_date,
  status            text not null default 'active'
                    check (status in ('active', 'completed', 'abandoned')),
  completed_at      timestamptz,
  created_at        timestamptz not null default now()
);

create index idx_reading_plans_user on public.reading_plans(user_id, status);

-- One active plan per user: PlanContext is null or a single plan, never a list.
-- Abandoning or completing a plan frees the slot for a new one.
create unique index idx_reading_plans_one_active
  on public.reading_plans(user_id) where status = 'active';

alter table public.reading_plans enable row level security;

create policy "Users read own plans" on public.reading_plans
  for select using (user_id = auth.uid());
create policy "Users insert own plans" on public.reading_plans
  for insert with check (user_id = auth.uid());
create policy "Users update own plans" on public.reading_plans
  for update using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- daily_logs -- one check-in per plan per day
-- reflection is sensitive, like problem_text. Never log it.
-- The client upserts on (plan_id, log_date); it must not fail on conflict.
-- ---------------------------------------------------------------------------

create table public.daily_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_id     uuid not null references public.reading_plans(id) on delete cascade,
  log_date    date not null default current_date,
  pages_read  integer not null default 0 check (pages_read >= 0),
  reflection  text,
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (plan_id, log_date)
);

create index idx_daily_logs_plan on public.daily_logs(plan_id, log_date desc);
create index idx_daily_logs_user on public.daily_logs(user_id, log_date desc);

alter table public.daily_logs enable row level security;

create policy "Users read own logs" on public.daily_logs
  for select using (user_id = auth.uid());
create policy "Users insert own logs" on public.daily_logs
  for insert with check (user_id = auth.uid());
create policy "Users update own logs" on public.daily_logs
  for update using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- streaks -- one row per user, updated in place
-- forgiveness_used is the "one free miss per streak" token; it resets to false
-- whenever a new streak begins. Calculation lives in lib/streak.ts.
-- ---------------------------------------------------------------------------

create table public.streaks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users(id) on delete cascade,
  current_count    integer not null default 0 check (current_count >= 0),
  longest_count    integer not null default 0 check (longest_count >= 0),
  last_log_date    date,
  forgiveness_used boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger streaks_set_updated_at
  before update on public.streaks
  for each row execute function public.set_updated_at();

alter table public.streaks enable row level security;

create policy "Users read own streak" on public.streaks
  for select using (user_id = auth.uid());
create policy "Users insert own streak" on public.streaks
  for insert with check (user_id = auth.uid());
create policy "Users update own streak" on public.streaks
  for update using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Table privileges for the Data API roles.
-- New Supabase projects no longer auto-expose tables created by a migration, so
-- the grants are explicit. RLS above still scopes every row to its owner; these
-- grants only decide which *statements* the role may attempt.
-- No grants to `anon`: Tayad has no guest mode, every user has an account.
-- No DELETE grants: account deletion cascades from auth.users, run by an Edge
-- Function with the service role.
-- ---------------------------------------------------------------------------

grant select, insert, update on public.profiles             to authenticated;
grant select                 on public.books                to authenticated;
grant select, insert         on public.recommendations      to authenticated;
grant select, insert         on public.recommendation_items to authenticated;
grant select, insert, update on public.reading_plans        to authenticated;
grant select, insert, update on public.daily_logs           to authenticated;
grant select, insert, update on public.streaks              to authenticated;

-- ---------------------------------------------------------------------------
-- Auto-provision a profile and an empty streak the moment a user signs up,
-- so the app never has to cope with a half-created account.
-- SECURITY DEFINER so it runs past RLS; search_path pinned for safety.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, new.raw_user_meta_data ->> 'display_name');
  insert into public.streaks (user_id)
    values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
