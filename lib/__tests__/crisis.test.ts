import { describe, expect, it } from '@jest/globals';

import { detectCrisis } from '../crisis';

describe('detectCrisis', () => {
  it('treats empty or whitespace-only input as not a crisis', () => {
    expect(detectCrisis('')).toEqual({ isCrisis: false, tier: null });
    expect(detectCrisis('   ')).toEqual({ isCrisis: false, tier: null });
  });

  it('does not flag ordinary "tired of" input', () => {
    const result = detectCrisis("I'm tired of my job and feeling unmotivated about my career.");
    expect(result.isCrisis).toBe(false);
    expect(result.tier).toBeNull();
  });

  describe('tier 1 — exact phrases', () => {
    it.each([
      'I want to kill myself',
      'sometimes I just want to die',
      'I keep thinking about suicide',
      'I have been hurting myself',
      'he hits me and I feel stuck',
      "I can't take it anymore",
    ])('flags "%s" immediately as tier 1', (text) => {
      expect(detectCrisis(text)).toEqual({ isCrisis: true, tier: 1 });
    });

    it('is case-insensitive', () => {
      expect(detectCrisis('I AM SUICIDAL').isCrisis).toBe(true);
    });

    it('matches on a substring anywhere in the text', () => {
      expect(detectCrisis('lately, honestly, i feel suicidal about all of it').tier).toBe(1);
    });
  });

  describe('tier 2 — weighted keywords', () => {
    it('does not flag a single low-weight keyword', () => {
      // "trapped" weighs 2, threshold is 7
      expect(detectCrisis('I feel trapped in my routine').isCrisis).toBe(false);
    });

    it('does not flag a couple of keywords below the threshold', () => {
      // hopeless (3) + trapped (2) = 5 < 7
      expect(detectCrisis('I feel hopeless and trapped').isCrisis).toBe(false);
    });

    it('flags once cumulative weight reaches the threshold', () => {
      // hopeless (3) + worthless (3) + trapped (2) = 8 >= 7
      const result = detectCrisis('I feel hopeless, worthless, and completely trapped');
      expect(result).toEqual({ isCrisis: true, tier: 2 });
    });

    it('flags a single high-weight phrase that crosses the threshold alone only when it does', () => {
      // "end the pain" weighs 4 — still below 7 on its own
      expect(detectCrisis('I just want to end the pain of this breakup').isCrisis).toBe(false);
      // "end the pain" (4) + "can't cope" (3) = 7
      expect(detectCrisis("I want to end the pain, I can't cope").isCrisis).toBe(true);
    });
  });
});
