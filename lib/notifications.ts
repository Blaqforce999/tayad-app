import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

// The daily reading reminder is a single repeating local notification. It is
// scheduled once (when the user picks a time in Settings) and re-scheduled if
// they change the time; the OS keeps firing it every day until it is cancelled.
//
// The copy is phrased around the feeling, never the book title
// (.agents/rules/design-system.md). It stays static because a repeating
// notification can't carry today's page count without going stale.

const REMINDER_ID = 'tayad-reading-reminder';
const ANDROID_CHANNEL_ID = 'reading-reminder';

const REMINDER_TITLE = 'Still tired of feeling stuck?';
const REMINDER_BODY = 'A few pages tonight keeps the streak alive.';

// Show the banner even if the app happens to be open when it fires.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type ReminderOutcome = 'scheduled' | 'permission-denied';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Reading reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    vibrationPattern: [0, 120],
    lightColor: '#E8A33D',
  });
}

/** Prompts for notification permission if it hasn't been decided yet. */
export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain) {
    return false;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Schedules (or re-schedules) the daily reminder at `hhmm` ("HH:MM", 24-hour).
 * Returns 'permission-denied' if the user hasn't allowed notifications — the
 * caller shows the "Reminders are optional" sheet in that case.
 */
export async function scheduleReadingReminder(hhmm: string): Promise<ReminderOutcome> {
  const granted = await requestReminderPermission();
  if (!granted) {
    return 'permission-denied';
  }

  await ensureAndroidChannel();
  await cancelReadingReminder();

  const [hourStr, minuteStr] = hhmm.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: REMINDER_TITLE,
      body: REMINDER_BODY,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : null),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return 'scheduled';
}

/** Removes the daily reminder (e.g. the user turned notifications off). */
export async function cancelReadingReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // Nothing scheduled under that id — fine.
  }
}
