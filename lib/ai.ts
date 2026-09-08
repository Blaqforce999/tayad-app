import { resolveSources } from './books';
import { fetchCatalogue } from './catalogue';
import { stubMatch } from './match-stub';
import { supabase } from './supabase';
import type { Recommendation, RecommendationRank } from './types';

// Result of a match attempt: three ranked books, or the matcher wants more context.
export type MatchResult =
  | { kind: 'picks'; picks: Recommendation[] }
  | { kind: 'clarify'; question: string };

type MatchPick = { book_id: string; rank: number; explanation: string };

// Calls the `match` Edge Function (real AI). If it isn't deployed yet or errors,
// falls back to the local keyword matcher so the flow keeps working.
export async function matchBooks(problemText: string): Promise<MatchResult> {
  try {
    const { data, error } = await supabase.functions.invoke('match', {
      body: { problem_text: problemText },
    });

    if (error || !data || data.ok === false) {
      throw error ?? new Error(data?.error?.message ?? 'match failed');
    }

    if (data.needs_clarification && typeof data.question === 'string') {
      return { kind: 'clarify', question: data.question };
    }

    const picks = await hydrate(Array.isArray(data.picks) ? data.picks : []);
    if (picks.length === 0) {
      throw new Error('no valid picks');
    }
    return { kind: 'picks', picks };
  } catch (err) {
    if (__DEV__) {
      console.warn('matchBooks: falling back to local matcher —', (err as Error).message);
    }
    return { kind: 'picks', picks: await stubMatch(problemText) };
  }
}

// AI output is untrusted: verify every book_id against the catalogue before use.
async function hydrate(rawPicks: MatchPick[]): Promise<Recommendation[]> {
  const catalogue = await fetchCatalogue();
  const byId = new Map(catalogue.map((book) => [book.id, book]));

  return rawPicks
    .map((pick): Recommendation | null => {
      const book = byId.get(pick.book_id);
      if (!book || ![1, 2, 3].includes(pick.rank)) {
        return null;
      }
      return {
        rank: pick.rank as RecommendationRank,
        book,
        explanation: pick.explanation,
        sources: resolveSources(book),
      };
    })
    .filter((rec): rec is Recommendation => rec !== null)
    .sort((a, b) => a.rank - b.rank);
}
