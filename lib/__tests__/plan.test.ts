import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_DAILY_PAGES,
  MAX_DAILY_PAGES,
  MIN_DAILY_PAGES,
  clampDailyPages,
  daysRemaining,
  pageRangeForDay,
  pagesRemaining,
  planTotalDays,
} from '../plan';

describe('planTotalDays', () => {
  it('rounds the last day up so it is never overloaded', () => {
    expect(planTotalDays(280, 15)).toBe(19); // 18.66 -> 19
    expect(planTotalDays(300, 15)).toBe(20);
  });

  it('returns 0 for a non-positive daily target', () => {
    expect(planTotalDays(280, 0)).toBe(0);
    expect(planTotalDays(280, -5)).toBe(0);
  });
});

describe('pageRangeForDay', () => {
  it('gives the 1-indexed span for a middle day', () => {
    expect(pageRangeForDay(3, 15, 280)).toEqual({ startPage: 31, endPage: 45 });
  });

  it('starts at page 1 on day one', () => {
    expect(pageRangeForDay(1, 15, 280)).toEqual({ startPage: 1, endPage: 15 });
  });

  it('clamps the final day to the total page count', () => {
    expect(pageRangeForDay(19, 15, 280)).toEqual({ startPage: 271, endPage: 280 });
  });
});

describe('pagesRemaining', () => {
  it('never goes negative', () => {
    expect(pagesRemaining(60, 280)).toBe(220);
    expect(pagesRemaining(300, 280)).toBe(0);
  });
});

describe('daysRemaining', () => {
  it('is the day count for whatever pages are still left', () => {
    expect(daysRemaining(60, 280, 15)).toBe(planTotalDays(220, 15));
    expect(daysRemaining(280, 280, 15)).toBe(0);
  });
});

describe('clampDailyPages', () => {
  it('holds the value inside the stepper bounds', () => {
    expect(clampDailyPages(MIN_DAILY_PAGES - 1)).toBe(MIN_DAILY_PAGES);
    expect(clampDailyPages(MAX_DAILY_PAGES + 50)).toBe(MAX_DAILY_PAGES);
    expect(clampDailyPages(DEFAULT_DAILY_PAGES)).toBe(DEFAULT_DAILY_PAGES);
  });
});
