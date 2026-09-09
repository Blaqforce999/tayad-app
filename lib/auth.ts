import type { AuthUser } from './types';
import { supabase } from './supabase';

// Thin wrappers around Supabase Auth. Screens call these; they never touch the
// supabase client's auth methods directly, so the surface stays small and every
// error path is handled the same way.

type SignUpResult = {
  // When the project requires email confirmation, sign-up succeeds but no
  // session is created until the user clicks the link in their inbox.
  needsEmailConfirmation: boolean;
};

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: displayName ? { data: { display_name: displayName } } : undefined,
  });

  if (error) {
    throw error;
  }

  return { needsEmailConfirmation: data.session === null };
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }
}

// signOut invalidates the session on the server, so a stolen token is useless
// afterwards (.agents/rules/security.md).
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function toAuthUser(user: { id: string; email?: string } | null | undefined): AuthUser | null {
  if (!user?.email) {
    return null;
  }

  return { id: user.id, email: user.email };
}

// Changes the account email. Supabase sends a confirmation link to the new
// address (and, if configured, the old one); the change lands once confirmed.
export async function changeEmail(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
  if (error) {
    throw error;
  }
}

// Sets a new password for the signed-in account. Takes effect immediately.
export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw error;
  }
}

// Sends the password-reset email. The link deep-links back into the app at
// /reset-password with a `code` we exchange for a short-lived session.
export async function sendPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    throw error;
  }
}

// Completes a reset: trades the emailed code for a session, then sets the password.
export async function completePasswordReset(code: string, password: string): Promise<void> {
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    throw exchangeError;
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw error;
  }
}
