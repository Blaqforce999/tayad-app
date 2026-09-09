import { CryptoDigestAlgorithm, digest } from 'expo-crypto';

// React Native has `crypto.getRandomValues` (via react-native-get-random-values)
// but no `crypto.subtle`. Supabase Auth's PKCE helper needs `subtle.digest` for
// a SHA-256 code challenge; without it, it warns on every auth call and falls
// back to a "plain" (unhashed) challenge, which is weaker for the OAuth flow.
//
// This adds a minimal `crypto.subtle.digest` backed by expo-crypto. It only
// patches when `crypto` exists and `subtle.digest` is missing, so it is a no-op
// on any platform that already has real WebCrypto.

type SubtleHost = {
  crypto?: {
    subtle?: { digest?: unknown } & Record<string, unknown>;
  };
};

const host = globalThis as unknown as SubtleHost;

const ALGORITHMS: Record<string, CryptoDigestAlgorithm> = {
  'SHA-1': CryptoDigestAlgorithm.SHA1,
  'SHA-256': CryptoDigestAlgorithm.SHA256,
  'SHA-384': CryptoDigestAlgorithm.SHA384,
  'SHA-512': CryptoDigestAlgorithm.SHA512,
};

if (host.crypto && typeof host.crypto.subtle?.digest !== 'function') {
  host.crypto.subtle = {
    ...(host.crypto.subtle ?? {}),
    digest: (algorithm: string | { name: string }, data: BufferSource): Promise<ArrayBuffer> => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm?.name;
      const algo = ALGORITHMS[name];
      if (!algo) {
        return Promise.reject(new Error(`crypto.subtle.digest: unsupported algorithm "${name}"`));
      }
      return digest(algo, data);
    },
  };
}
