// Alternative to the delete_my_account() SQL function: an Edge Function that
// removes the caller's auth user with the service role. Use this if the SQL
// function hits a permissions wall on your project.
//
// Deploy:  supabase functions deploy delete-account
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ ok: false, error: 'Unauthenticated' }, 401);
  }

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Identify the caller with their own token (RLS in force).
  const asUser = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await asUser.auth.getUser();

  if (userError || !user) {
    return json({ ok: false, error: 'Unauthenticated' }, 401);
  }

  // Delete with the service role. Cascades through every public.* table.
  const admin = createClient(url, serviceKey);
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('delete-account failed', error.message);
    return json({ ok: false, error: 'DeleteFailed' }, 500);
  }

  return json({ ok: true }, 200);
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
