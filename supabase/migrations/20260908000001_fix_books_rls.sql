-- Fix: nobody could read the book catalogue.
--
-- The original policy used `auth.role() = 'authenticated'`. That helper is
-- deprecated on current Supabase projects and evaluates to null, so the USING
-- clause was never true and every catalogue read came back empty — which
-- surfaced in the app as "Not the right match - yet" and NO_CATALOGUE from the
-- match Edge Function.
--
-- The modern equivalent is a TO clause naming the role directly.

drop policy if exists "Authenticated users read books" on public.books;

create policy "Authenticated users read books" on public.books
  for select
  to authenticated
  using (true);
