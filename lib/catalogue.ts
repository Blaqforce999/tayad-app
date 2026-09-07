import { supabase } from './supabase';
import type { Book } from './types';

// Raw shape of a public.books row (snake_case, as the Supabase client returns it).
type BookRow = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  page_count: number;
  cover_url: string | null;
  description: string | null;
  free_source_url: string | null;
  amazon_url: string | null;
  google_play_url: string | null;
  kobo_url: string | null;
  problem_tags: string[];
};

export type CatalogueBook = Book & { description?: string };

function toBook(row: BookRow): CatalogueBook {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.title,
    author: row.author,
    pageCount: row.page_count,
    tags: row.problem_tags ?? [],
    coverUrl: row.cover_url ?? undefined,
    description: row.description ?? undefined,
    hasFreeSource: Boolean(row.free_source_url),
    freeSourceUrl: row.free_source_url ?? undefined,
    amazonUrl: row.amazon_url ?? undefined,
    googlePlayUrl: row.google_play_url ?? undefined,
    koboUrl: row.kobo_url ?? undefined,
  };
}

export async function fetchCatalogue(): Promise<CatalogueBook[]> {
  const { data, error } = await supabase.from('books').select('*');
  if (error) {
    throw error;
  }
  return (data as BookRow[]).map(toBook);
}

export async function fetchBookById(id: string): Promise<CatalogueBook | null> {
  const { data, error } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw error;
  }
  return data ? toBook(data as BookRow) : null;
}
