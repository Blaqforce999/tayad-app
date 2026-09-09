import { describe, expect, it } from '@jest/globals';

import {
  aiPickSchema,
  aiResponseSchema,
  dailyPagesSchema,
  notificationTimeSchema,
  problemInputSchema,
  waitlistEmailSchema,
} from '../validators';

describe('problemInputSchema', () => {
  it('rejects input shorter than 10 characters after trimming', () => {
    expect(problemInputSchema.safeParse('  short  ').success).toBe(false);
  });

  it('trims and accepts a real sentence', () => {
    const result = problemInputSchema.safeParse('  I keep starting books and never finishing them.  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('I keep starting books and never finishing them.');
    }
  });

  it('rejects input over 2000 characters', () => {
    expect(problemInputSchema.safeParse('a'.repeat(2001)).success).toBe(false);
  });
});

describe('notificationTimeSchema', () => {
  it.each(['00:00', '08:00', '13:45', '23:59'])('accepts %s', (t) => {
    expect(notificationTimeSchema.safeParse(t).success).toBe(true);
  });

  it.each(['8:00', '24:00', '20:60', '2000', '20:00 ', 'morning'])('rejects %s', (t) => {
    expect(notificationTimeSchema.safeParse(t).success).toBe(false);
  });
});

describe('dailyPagesSchema', () => {
  it('accepts a sensible whole number', () => {
    expect(dailyPagesSchema.safeParse(15).success).toBe(true);
  });

  it.each([0, -5, 201, 1.5])('rejects %s', (n) => {
    expect(dailyPagesSchema.safeParse(n).success).toBe(false);
  });
});

describe('aiPickSchema / aiResponseSchema', () => {
  const validPick = {
    book_id: '550e8400-e29b-41d4-a716-446655440000',
    rank: 1 as const,
    explanation: 'A grounded guide to breaking the patterns that keep pulling you back to the start.',
  };

  it('accepts a well-formed pick', () => {
    expect(aiPickSchema.safeParse(validPick).success).toBe(true);
  });

  it('rejects a non-UUID book_id', () => {
    expect(aiPickSchema.safeParse({ ...validPick, book_id: 'book-1' }).success).toBe(false);
  });

  it('rejects a rank outside 1..3', () => {
    expect(aiPickSchema.safeParse({ ...validPick, rank: 4 }).success).toBe(false);
  });

  it('rejects an explanation that is too short', () => {
    expect(aiPickSchema.safeParse({ ...validPick, explanation: 'too short' }).success).toBe(false);
  });

  it('requires exactly three picks in a response', () => {
    expect(aiResponseSchema.safeParse({ picks: [validPick, validPick] }).success).toBe(false);
    expect(
      aiResponseSchema.safeParse({
        picks: [
          { ...validPick, rank: 1 },
          { ...validPick, rank: 2 },
          { ...validPick, rank: 3 },
        ],
      }).success,
    ).toBe(true);
  });
});

describe('waitlistEmailSchema', () => {
  it('accepts a valid address', () => {
    expect(waitlistEmailSchema.safeParse('reader@tayad.app').success).toBe(true);
  });

  it('rejects a malformed address', () => {
    expect(waitlistEmailSchema.safeParse('reader@').success).toBe(false);
  });
});
