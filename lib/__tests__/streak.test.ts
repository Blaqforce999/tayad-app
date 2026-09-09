import { describe, expect, it } from '@jest/globals';

import type { StreakState } from '../types';
import {
  calculateStreakUpdate,
  daysBetween,
  hasForgivenessAvailable,
  isStreakAlive,
  todayDateString,
} from '../streak';

const base: StreakState = {
  count: 0,
  longest: 0,
  forgivenessUsed: false,
  lastLogDate: null,
};

describe('todayDateString', () => {
  it('returns a zero-padded YYYY-MM-DD string', () => {
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('daysBetween', () => {
  it('counts whole calendar days, signed', () => {
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
    expect(daysBetween('2026-01-10', '2026-01-01')).toBe(-9);
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1); // 2026 is not a leap year
  });
});

describe('calculateStreakUpdate', () => {
  it('starts a streak at 1 on the first ever log', () => {
    expect(calculateStreakUpdate(base, '2026-03-01')).toEqual({
      count: 1,
      longest: 1,
      forgivenessUsed: false,
      lastLogDate: '2026-03-01',
    });
  });

  it('is idempotent when already logged today', () => {
    const current: StreakState = {
      count: 4,
      longest: 9,
      forgivenessUsed: true,
      lastLogDate: '2026-03-01',
    };
    expect(calculateStreakUpdate(current, '2026-03-01')).toBe(current);
  });

  it('increments on a consecutive day and lifts the longest', () => {
    const current: StreakState = {
      count: 9,
      longest: 9,
      forgivenessUsed: false,
      lastLogDate: '2026-03-01',
    };
    expect(calculateStreakUpdate(current, '2026-03-02')).toEqual({
      count: 10,
      longest: 10,
      forgivenessUsed: false,
      lastLogDate: '2026-03-02',
    });
  });

  it('consumes the forgiveness token on a single missed day and keeps the streak', () => {
    const current: StreakState = {
      count: 5,
      longest: 12,
      forgivenessUsed: false,
      lastLogDate: '2026-03-01',
    };
    expect(calculateStreakUpdate(current, '2026-03-03')).toEqual({
      count: 6,
      longest: 12,
      forgivenessUsed: true,
      lastLogDate: '2026-03-03',
    });
  });

  it('breaks the streak on a missed day once forgiveness is already used', () => {
    const current: StreakState = {
      count: 5,
      longest: 12,
      forgivenessUsed: true,
      lastLogDate: '2026-03-01',
    };
    expect(calculateStreakUpdate(current, '2026-03-03')).toEqual({
      count: 1,
      longest: 12,
      forgivenessUsed: false,
      lastLogDate: '2026-03-03',
    });
  });

  it('breaks the streak when more than one day is missed', () => {
    const current: StreakState = {
      count: 30,
      longest: 30,
      forgivenessUsed: false,
      lastLogDate: '2026-03-01',
    };
    expect(calculateStreakUpdate(current, '2026-03-06')).toEqual({
      count: 1,
      longest: 30,
      forgivenessUsed: false,
      lastLogDate: '2026-03-06',
    });
  });

  it('never lowers the longest streak', () => {
    const current: StreakState = {
      count: 2,
      longest: 40,
      forgivenessUsed: false,
      lastLogDate: '2026-03-01',
    };
    expect(calculateStreakUpdate(current, '2026-03-20').longest).toBe(40);
  });
});

describe('helpers', () => {
  it('isStreakAlive is true only for a non-zero count', () => {
    expect(isStreakAlive({ ...base, count: 0 })).toBe(false);
    expect(isStreakAlive({ ...base, count: 1 })).toBe(true);
  });

  it('hasForgivenessAvailable mirrors !forgivenessUsed', () => {
    expect(hasForgivenessAvailable({ ...base, forgivenessUsed: false })).toBe(true);
    expect(hasForgivenessAvailable({ ...base, forgivenessUsed: true })).toBe(false);
  });
});
