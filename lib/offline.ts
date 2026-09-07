import AsyncStorage from '@react-native-async-storage/async-storage';

import { checkInToday } from './plans';
import { recordStreakCheckIn } from './streaks';

// A single pending daily check-in, held while the device is offline. The queue
// holds at most one entry per the architecture (one check-in per plan per day).
const KEY = 'tayad.pendingCheckIn';

type PendingCheckIn = {
  planId: string;
  pagesRead: number;
  queuedAt: string;
};

export async function queueCheckIn(planId: string, pagesRead: number): Promise<void> {
  const payload: PendingCheckIn = {
    planId,
    pagesRead,
    queuedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function hasPendingCheckIn(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) !== null;
}

// Best effort: replays the queued check-in when connectivity returns. Returns
// true if something was flushed (so the caller can refresh its state).
export async function flushPendingCheckIn(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return false;
  }

  try {
    const pending = JSON.parse(raw) as PendingCheckIn;
    await checkInToday({ planId: pending.planId, pagesRead: pending.pagesRead });
    await recordStreakCheckIn();
    await AsyncStorage.removeItem(KEY);
    return true;
  } catch {
    // Still offline or the write failed — leave it queued for next time.
    return false;
  }
}
