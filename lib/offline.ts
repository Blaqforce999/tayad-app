import AsyncStorage from '@react-native-async-storage/async-storage';

import { attachReflection, checkInToday } from './plans';
import { recordStreakCheckIn } from './streaks';

// Writes made while the device was offline, replayed when connectivity returns.
// At most one of each is held — the architecture allows a single check-in per
// plan per day, and a reflection attaches to that same day's log.
const CHECK_IN_KEY = 'tayad.pendingCheckIn';
const REFLECTION_KEY = 'tayad.pendingReflection';

type PendingCheckIn = { planId: string; pagesRead: number; queuedAt: string };
type PendingReflection = { planId: string; text: string; queuedAt: string };

export async function queueCheckIn(planId: string, pagesRead: number): Promise<void> {
  const payload: PendingCheckIn = { planId, pagesRead, queuedAt: new Date().toISOString() };
  await AsyncStorage.setItem(CHECK_IN_KEY, JSON.stringify(payload));
}

export async function queueReflection(planId: string, text: string): Promise<void> {
  const payload: PendingReflection = { planId, text, queuedAt: new Date().toISOString() };
  await AsyncStorage.setItem(REFLECTION_KEY, JSON.stringify(payload));
}

export async function hasPendingWrites(): Promise<boolean> {
  const [checkIn, reflection] = await AsyncStorage.multiGet([CHECK_IN_KEY, REFLECTION_KEY]);
  return checkIn[1] !== null || reflection[1] !== null;
}

// Best effort. Returns true if anything was flushed, so the caller can refresh.
// The check-in goes first: a reflection attaches to the log it creates.
export async function flushPending(): Promise<boolean> {
  let flushed = false;

  const rawCheckIn = await AsyncStorage.getItem(CHECK_IN_KEY);
  if (rawCheckIn) {
    try {
      const pending = JSON.parse(rawCheckIn) as PendingCheckIn;
      await checkInToday({ planId: pending.planId, pagesRead: pending.pagesRead });
      await recordStreakCheckIn();
      await AsyncStorage.removeItem(CHECK_IN_KEY);
      flushed = true;
    } catch {
      // Still offline or the write failed — leave it queued and stop here so the
      // reflection doesn't land before the log it belongs to.
      return flushed;
    }
  }

  const rawReflection = await AsyncStorage.getItem(REFLECTION_KEY);
  if (rawReflection) {
    try {
      const pending = JSON.parse(rawReflection) as PendingReflection;
      await attachReflection(pending.planId, pending.text);
      await AsyncStorage.removeItem(REFLECTION_KEY);
      flushed = true;
    } catch {
      // Leave it queued for next time.
    }
  }

  return flushed;
}
