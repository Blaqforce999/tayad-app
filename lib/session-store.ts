import type { Recommendation } from './types';

// A tiny in-memory holder for the recommendation the user is currently working
// through (problem -> 3 books -> pick -> plan). It is NOT persisted and never
// leaves the device; the durable records are written to Supabase separately.

type RecommendationSession = {
  problemText: string;
  recommendationId: string | null;
  picks: Recommendation[];
};

let current: RecommendationSession | null = null;

export function setRecommendationSession(session: RecommendationSession): void {
  current = session;
}

export function getRecommendationSession(): RecommendationSession | null {
  return current;
}

export function findPick(bookId: string): Recommendation | undefined {
  return current?.picks.find((pick) => pick.book.id === bookId);
}

export function clearRecommendationSession(): void {
  current = null;
}
