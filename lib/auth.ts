import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { AuthUser } from './types';
import { supabase } from './supabase';

// Thin wrappers around Supabase Auth. Screens call these; they never touch the
// supabase client's auth methods directly, so the surface stays small and every
// error path is handled the same way.

// Lets the auth browser tab hand control back to the app after the redirect.
WebBrowser.maybeCompleteAuthSession();

// Thrown when the user backs out of the OAuth browser — callers ignore it.
export class OAuthCancelledError extends Error {
  constructor() {
    super('OAuth flow cancelled by the user.');
    this.name = 'OAuthCancelledError';
  }
}

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

// Google OAuth via the system browser. Supabase gives us the provider URL, we
// open it, and on the redirect back we trade the PKCE `code` for a session.
// Requires the Google provider to be enabled in the Supabase dashboard.
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('/');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) {
    throw error;
  }
  if (!data?.url) {
    throw new Error('Google sign-in is unavailable right now.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new OAuthCancelledError();
  }

  const code = new URL(result.url).searchParams.get('code');
  if (!code) {
    throw new Error('Google sign-in did not complete. Try again.');
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    throw exchangeError;
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
