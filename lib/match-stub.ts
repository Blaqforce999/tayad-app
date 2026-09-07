import { resolveSources } from './books';
import { fetchCatalogue } from './catalogue';
import type { Recommendation, RecommendationRank } from './types';

// TEMPORARY local matcher. The real thing is the `match` Supabase Edge Function
// (problem text -> Open Router -> validated against the catalogue). This keeps
// the whole Core Loop walkable until that ships. It does NOT leave the device
// except to read the shared catalogue.

// Light keyword -> tag hints so free-text like "I keep procrastinating" reaches
// books tagged 'procrastination' even when the exact word is absent.
const KEYWORD_TAGS: Record<string, string[]> = {
  stuck: ['change', 'procrastination', 'purpose'],
  procrastinat: ['procrastination', 'discipline', 'focus'],
  focus: ['focus', 'distraction'],
  distract: ['distraction', 'focus'],
  phone: ['distraction'],
  anxious: ['anxiety', 'stress'],
  anxiety: ['anxiety', 'stress'],
  worry: ['anxiety', 'stress'],
  stress: ['stress', 'anxiety'],
  overwhelm: ['overwhelm', 'stress'],
  tired: ['stress', 'health'],
  sleep: ['health'],
  money: ['money'],
  broke: ['money'],
  spend: ['money'],
  confidence: ['confidence', 'self-worth'],
  worth: ['self-worth', 'confidence'],
  doubt: ['self-worth', 'confidence'],
  relationship: ['relationships', 'communication'],
  partner: ['relationships'],
  lonely: ['relationships', 'self-worth'],
  career: ['career', 'purpose'],
  job: ['career', 'purpose'],
  purpose: ['purpose', 'meaning'],
  meaning: ['meaning', 'purpose'],
  grief: ['grief', 'resilience'],
  loss: ['grief', 'resilience'],
  habit: ['habits', 'discipline'],
  discipline: ['discipline', 'habits'],
};

function inferTags(problemText: string): Set<string> {
  const text = problemText.toLowerCase();
  const tags = new Set<string>();
  for (const [keyword, mapped] of Object.entries(KEYWORD_TAGS)) {
    if (text.includes(keyword)) {
      mapped.forEach((tag) => tags.add(tag));
    }
  }
  return tags;
}

function explanationFor(tags: string[]): string {
  if (tags.length === 0) {
    return 'A widely trusted starting point that meets you where you are.';
  }
  const focus = tags.slice(0, 2).join(' and ');
  return `Speaks directly to the ${focus} you described, with a plan you can actually finish.`;
}

export async function stubMatch(problemText: string): Promise<Recommendation[]> {
  const catalogue = await fetchCatalogue();
  const wanted = inferTags(problemText);

  const scored = catalogue
    .map((book) => {
      const overlap = book.tags.filter((tag) => wanted.has(tag));
      // Tie-break with a stable hash so results are deterministic per problem.
      const jitter = (book.id.charCodeAt(0) + problemText.length) % 3;
      return { book, score: overlap.length * 10 + jitter, matchedTags: overlap };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map((entry, index) => ({
    rank: (index + 1) as RecommendationRank,
    book: entry.book,
    explanation: explanationFor(entry.matchedTags.length ? entry.matchedTags : entry.book.tags),
    sources: resolveSources(entry.book),
  }));
}
