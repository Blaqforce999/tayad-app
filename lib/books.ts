import type { Book, BookSources } from './types';

// Where a user can actually get a recommended book. Free legal sources first,
// purchase deep links as a fallback. Tayad never hosts anything.
//
// The `match` Edge Function will eventually return resolved sources; until then
// we build them here from the catalogue row + the ISBN.

function isbnSearch(base: string, isbn: string): string {
  return `${base}${encodeURIComponent(isbn)}`;
}

export function resolveSources(book: Book): BookSources {
  return {
    isFree: book.hasFreeSource,
    freeSourceUrl: book.freeSourceUrl,
    amazonUrl: book.amazonUrl ?? isbnSearch('https://www.amazon.com/s?k=', book.isbn),
    googlePlayUrl:
      book.googlePlayUrl ??
      isbnSearch('https://play.google.com/store/search?c=books&q=', book.isbn),
    koboUrl: book.koboUrl ?? isbnSearch('https://www.kobo.com/us/en/search?query=', book.isbn),
  };
}

export type PurchaseOption = { label: string; url: string };

export function purchaseOptions(sources: BookSources): PurchaseOption[] {
  const options: PurchaseOption[] = [];
  if (sources.amazonUrl) {
    options.push({ label: 'Amazon', url: sources.amazonUrl });
  }
  if (sources.googlePlayUrl) {
    options.push({ label: 'Google Play Books', url: sources.googlePlayUrl });
  }
  if (sources.koboUrl) {
    options.push({ label: 'Kobo', url: sources.koboUrl });
  }
  return options;
}
