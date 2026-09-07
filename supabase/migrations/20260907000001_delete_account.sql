-- Self-service account deletion.
--
-- Runs as the definer (postgres) so it can remove the row in auth.users for the
-- calling user. Every table in `public` has a foreign key to auth.users(id)
-- ON DELETE CASCADE, so this single delete also removes the user's profile,
-- recommendations, recommendation_items, reading_plans, daily_logs and streak.
--
-- "Delete my account" must actually delete everything (.agents/rules/security.md).

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- auth.uid() is null for anon; the function is only granted to `authenticated`.
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
