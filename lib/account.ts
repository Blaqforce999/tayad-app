import { supabase } from './supabase';

// Permanently deletes the signed-in user and every row that cascades from
// auth.users. Tries the delete_my_account() SQL function first; if that isn't
// present on the project, falls back to the delete-account Edge Function.
export async function deleteAccount(): Promise<void> {
  const rpc = await supabase.rpc('delete_my_account');

  if (rpc.error) {
    const fn = await supabase.functions.invoke('delete-account');
    if (fn.error) {
      // Surface the original RPC error — it's usually the more useful one.
      throw rpc.error;
    }
  }

  // Server-side session is gone; clear the local copy without a network call.
  await supabase.auth.signOut({ scope: 'local' });
}
