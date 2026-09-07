import type { CrisisResult } from './types';

// ---------------------------------------------------------------------------
// Tier 1 — Exact phrase matching
// These are unambiguous crisis signals. Any match triggers immediately.
// Case-insensitive substring matching.
// ---------------------------------------------------------------------------

const TIER_1_PHRASES: string[] = [
  'kill myself',
  'killing myself',
  'want to die',
  'want to be dead',
  'end my life',
  'end it all',
  'take my life',
  'take my own life',
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'cutting myself',
  'cut myself',
  'hurting myself',
  'hurt myself',
  'harm myself',
  'harming myself',
  'don\'t want to live',
  'dont want to live',
  'no reason to live',
  'not worth living',
  'life is not worth',
  'better off dead',
  'better off without me',
  'rather be dead',
  'wish i was dead',
  'wish i were dead',
  'being abused',
  'someone is hurting me',
  'he is hurting me',
  'she is hurting me',
  'they are hurting me',
  'being hit',
  'he hits me',
  'she hits me',
  'domestic violence',
  'overdose',
  'can\'t take it anymore',
  'cant take it anymore',
  'can\'t go on anymore',
  'cant go on anymore',
  'nothing left to live for',
  'no point in living',
];

// ---------------------------------------------------------------------------
// Tier 2 — Weighted keyword scoring
// Individual keywords that are concerning but ambiguous.
// If cumulative weight >= THRESHOLD, crisis triggers.
// ---------------------------------------------------------------------------

const TIER_2_KEYWORDS: Array<{ phrase: string; weight: number }> = [
  { phrase: 'hopeless', weight: 3 },
  { phrase: 'worthless', weight: 3 },
  { phrase: 'no point', weight: 3 },
  { phrase: 'can\'t go on', weight: 4 },
  { phrase: 'cant go on', weight: 4 },
  { phrase: 'trapped', weight: 2 },
  { phrase: 'escape everything', weight: 3 },
  { phrase: 'escape it all', weight: 3 },
  { phrase: 'nobody cares', weight: 2 },
  { phrase: 'no one cares', weight: 2 },
  { phrase: 'give up on life', weight: 4 },
  { phrase: 'see no way out', weight: 4 },
  { phrase: 'no way out', weight: 3 },
  { phrase: 'completely alone', weight: 2 },
  { phrase: 'all alone', weight: 2 },
  { phrase: 'unbearable', weight: 2 },
  { phrase: 'cannot cope', weight: 3 },
  { phrase: 'can\'t cope', weight: 3 },
  { phrase: 'cant cope', weight: 3 },
  { phrase: 'feel empty', weight: 2 },
  { phrase: 'feeling empty', weight: 2 },
  { phrase: 'dead inside', weight: 3 },
  { phrase: 'disappear', weight: 2 },
  { phrase: 'wish i could disappear', weight: 4 },
  { phrase: 'end the pain', weight: 4 },
  { phrase: 'stop the pain', weight: 2 },
  { phrase: 'burden to everyone', weight: 4 },
  { phrase: 'burden to others', weight: 3 },
  { phrase: 'everyone would be better', weight: 4 },
];

const TIER_2_THRESHOLD = 7;

// ---------------------------------------------------------------------------
// Detection function
// Crisis check runs client-side BEFORE any network call.
// If isCrisis is true, the problem text NEVER leaves the device.
// ---------------------------------------------------------------------------

export function detectCrisis(text: string): CrisisResult {
  if (!text || text.trim().length === 0) {
    return { isCrisis: false, tier: null };
  }

  const normalised = text.toLowerCase();

  // Tier 1: exact phrase — any match is immediate
  for (const phrase of TIER_1_PHRASES) {
    if (normalised.includes(phrase)) {
      return { isCrisis: true, tier: 1 };
    }
  }

  // Tier 2: weighted score
  let score = 0;
  for (const { phrase, weight } of TIER_2_KEYWORDS) {
    if (normalised.includes(phrase)) {
      score += weight;
      if (score >= TIER_2_THRESHOLD) {
        return { isCrisis: true, tier: 2 };
      }
    }
  }

  return { isCrisis: false, tier: null };
}
