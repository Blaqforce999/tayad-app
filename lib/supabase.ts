import 'react-native-url-polyfill/auto';

import { AppState } from 'react-native';

import { createClient } from '@supabase/supabase-js';

import { largeSecureStore } from './secure-storage';
// Must come after secure-storage (which loads react-native-get-random-values, so
// `crypto` exists) and before the client is created: adds `crypto.subtle.digest`
// so PKCE uses a real SHA-256 challenge instead of the "plain" fallback.
import './crypto-subtle-shim';

// The mobile app reaches Supabase ONLY through this singleton, and it is created
// with the anon key. There is no service-role client anywhere outside
// supabase/functions (.agents/rules/security.md). Row Level Security is the
// authorization boundary; everything this client does is subject to it.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in the values from the Supabase dashboard.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: largeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    // No URL-based session detection on native; sessions come from secure storage.
    detectSessionInUrl: false,
    // PKCE puts a `code` in the query string of email links, which Expo Router
    // can read as a route param. The implicit flow uses a URL fragment, which
    // native deep links drop.
    flowType: 'pkce',
  },
});

// Run the token-refresh timer only while the app is foregrounded. Left alone,
// Supabase's timer keeps firing (and failing) in the background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
