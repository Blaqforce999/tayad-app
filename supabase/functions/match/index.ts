// Tayad's problem-to-book matcher.
//
// Input:  { problem_text: string }   (crisis text is screened on the client and
//          never reaches here)
// Output: { ok: true, picks: [{ book_id, rank, explanation }] }   (exactly 3)
//    or   { ok: true, needs_clarification: true, question: string }
//    or   { ok: false, error: { code, message } }
//
// It does NOT write to the database — the client persists the recommendation,
// its items and the reading plan. See .agents/workflows/new-edge-function.md.
//
// Deploy:  supabase functions deploy match
// Secrets: OPEN_ROUTER_API_KEY (required), OPEN_ROUTER_MODEL (optional)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-2-9b-it:free';
const MATCHES_PER_HOUR = 5;

type CatalogueBook = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  problem_tags: string[];
};

type Pick = { book_id: string; rank: 1 | 2 | 3; explanation: string };

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors() });
  }

  // --- input -------------------------------------------------------------
  let problemText = '';
  try {
    const body = await req.json();
    problemText = typeof body?.problem_text === 'string' ? body.problem_text.trim() : '';
  } catch {
    return fail('BAD_REQUEST', 'Could not read the request.', 400);
  }
  if (problemText.length < 10 || problemText.length > 2000) {
    return fail('BAD_REQUEST', 'Tell us a little more about what you are tired of.', 400);
  }

  // --- auth (RLS in force for every read below) -------------------------
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return fail('UNAUTHENTICATED', 'Please sign in.', 401);
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return fail('UNAUTHENTICATED', 'Please sign in.', 401);
  }

  // --- rate limit ------------------------------------------------------
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('recommendations')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', hourAgo);
  if ((count ?? 0) >= MATCHES_PER_HOUR) {
    return fail('RATE_LIMITED', 'Take a breath — you can look for another book in a little while.', 429);
  }

  // --- catalogue ------------------------------------------------------
  const { data: catalogue, error: catError } = await supabase
    .from('books')
    .select('id, title, author, isbn, problem_tags');
  if (catError || !catalogue || catalogue.length === 0) {
    return fail('NO_CATALOGUE', 'Could not load the book list. Try again shortly.', 500);
  }
  const books = catalogue as CatalogueBook[];
  const byId = new Map(books.map((b) => [b.id, b]));

  // --- ask the model ------------------------------------------------
  const apiKey = Deno.env.get('OPEN_ROUTER_API_KEY');
  const model = Deno.env.get('OPEN_ROUTER_MODEL') || DEFAULT_MODEL;

  let aiPicks: Pick[] | null = null;
  let clarification: string | null = null;

  if (apiKey) {
    try {
      const result = await askModel(apiKey, model, problemText, books);
      if (result.kind === 'clarify') {
        clarification = result.question;
      } else {
        aiPicks = result.picks.filter((p) => byId.has(p.book_id));
      }
    } catch (err) {
      console.error('match: model call failed', (err as Error).message);
    }
  }

  if (clarification) {
    console.log('match: clarification requested', { user: user.id });
    return ok({ needs_clarification: true, question: clarification });
  }

  // --- fill to exactly 3 with a keyword fallback -----------------
  const picks = padToThree(aiPicks ?? [], problemText, books);

  console.log('match: success', {
    user: user.id,
    books: picks.map((p) => p.book_id),
    aiUsed: (aiPicks?.length ?? 0) > 0,
  });

  return ok({ picks });
});

// ---------------------------------------------------------------------------

async function askModel(
  apiKey: string,
  model: string,
  problemText: string,
  books: CatalogueBook[],
): Promise<{ kind: 'picks'; picks: Pick[] } | { kind: 'clarify'; question: string }> {
  const catalogueLines = books
    .map((b) => `${b.id} | ${b.title} — ${b.author} | tags: ${b.problem_tags.join(', ')}`)
    .join('\n');

  const system = [
    "You are Tayad's book matcher. A person tells you what they are tired of; you pick books that help.",
    'Rules:',
    '- Recommend ONLY from the catalogue below, by its exact id.',
    '- Return EXACTLY three, ranked 1 to 3 by how well they fit this person. Rank 1 is the primary pick.',
    '- Each explanation is one or two sentences, written to the person ("you"), naming their situation. No plot summary.',
    '- Never diagnose, never give medical, legal, or therapy advice, never discuss anything except which book to read.',
    '- If the message is too vague to match well, ask one short clarifying question instead.',
    'Reply with JSON only, no prose, one of:',
    '{"picks":[{"book_id":"<id>","rank":1,"explanation":"..."},{"book_id":"<id>","rank":2,"explanation":"..."},{"book_id":"<id>","rank":3,"explanation":"..."}]}',
    '{"needs_clarification":true,"question":"..."}',
  ].join('\n');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'Tayad',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: `Catalogue:\n${catalogueLines}\n\nWhat they are tired of:\n${problemText}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJson(content);

  if (parsed?.needs_clarification && typeof parsed.question === 'string') {
    return { kind: 'clarify', question: parsed.question.slice(0, 200) };
  }

  const rawPicks = Array.isArray(parsed?.picks) ? parsed.picks : [];
  const picks: Pick[] = rawPicks
    .filter(
      (p: unknown): p is Pick =>
        !!p &&
        typeof (p as Pick).book_id === 'string' &&
        [1, 2, 3].includes((p as Pick).rank) &&
        typeof (p as Pick).explanation === 'string',
    )
    .map((p: Pick) => ({
      book_id: p.book_id,
      rank: p.rank,
      explanation: p.explanation.trim().slice(0, 500),
    }));

  return { kind: 'picks', picks };
}

// Pull the first JSON object out of a model response (handles ```json fences).
function extractJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) {
    return null;
  }
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Guarantees exactly three ranked picks. Keeps the model's, then fills from the
// catalogue by keyword→tag overlap with the problem text.
function padToThree(aiPicks: Pick[], problemText: string, books: CatalogueBook[]): Pick[] {
  const chosen: Pick[] = [];
  const used = new Set<string>();

  for (const pick of aiPicks) {
    if (chosen.length >= 3 || used.has(pick.book_id)) {
      continue;
    }
    chosen.push(pick);
    used.add(pick.book_id);
  }

  if (chosen.length < 3) {
    const wanted = inferTags(problemText);
    const ranked = books
      .filter((b) => !used.has(b.id))
      .map((b) => ({ b, score: b.problem_tags.filter((t) => wanted.has(t)).length }))
      .sort((a, z) => z.score - a.score);

    for (const { b } of ranked) {
      if (chosen.length >= 3) {
        break;
      }
      chosen.push({
        book_id: b.id,
        rank: (chosen.length + 1) as 1 | 2 | 3,
        explanation:
          'A widely trusted starting point that lines up with what you described.',
      });
      used.add(b.id);
    }
  }

  return chosen.slice(0, 3).map((p, i) => ({ ...p, rank: (i + 1) as 1 | 2 | 3 }));
}

const KEYWORD_TAGS: Record<string, string[]> = {
  procrastinat: ['procrastination', 'discipline', 'focus'],
  focus: ['focus', 'distraction'],
  distract: ['distraction', 'focus'],
  anx: ['anxiety', 'stress'],
  worry: ['anxiety', 'stress'],
  stress: ['stress', 'anxiety'],
  overwhelm: ['overwhelm', 'stress'],
  sleep: ['health'],
  money: ['money'],
  spend: ['money'],
  confiden: ['confidence', 'self-worth'],
  doubt: ['self-worth', 'confidence'],
  relationship: ['relationships', 'communication'],
  lonely: ['relationships', 'self-worth'],
  career: ['career', 'purpose'],
  job: ['career', 'purpose'],
  purpose: ['purpose', 'meaning'],
  grief: ['grief', 'resilience'],
  loss: ['grief', 'resilience'],
  habit: ['habits', 'discipline'],
  stuck: ['change', 'procrastination', 'purpose'],
};

function inferTags(text: string): Set<string> {
  const lower = text.toLowerCase();
  const tags = new Set<string>();
  for (const [keyword, mapped] of Object.entries(KEYWORD_TAGS)) {
    if (lower.includes(keyword)) {
      mapped.forEach((t) => tags.add(t));
    }
  }
  return tags;
}

// ---------------------------------------------------------------------------

function cors(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  };
}

function ok(data: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

function fail(code: string, message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: { code, message } }), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });
}
