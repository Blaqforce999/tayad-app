import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import {
  REMINDER_OPTIONS,
  fetchProfile,
  formatReminderTime,
  updateNotificationTime,
} from '@/lib/settings';
import { tokens } from '@/lib/tokens';

export default function SettingsReminderScreen() {
  const [time, setTime] = useState('20:00');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((profile) => setTime(profile.notificationTime))
      .catch(() => undefined);
  }, []);

  const { time: displayTime, period } = formatReminderTime(time);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNotificationTime(time);
      // Notification *scheduling* is wired with the Edge Functions pass.
      router.back();
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={tokens.colors.text} />
        </Pressable>
        <AppText variant="labelButton">Reading reminder</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.lead}>
          <AppText variant="displayMedium">When should we nudge you?</AppText>
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            We'll phrase it around what you're tired of, never the book title.
          </AppText>
        </View>

        <Card variant="raised" style={styles.timeCard}>
          <AppText style={styles.bigTime}>{displayTime}</AppText>
          <AppText style={styles.period}>{period}</AppText>
        </Card>

        <View style={styles.chips}>
          {REMINDER_OPTIONS.map((option) => {
            const active = option.value === time;
            return (
              <Pressable
                key={option.value}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setTime(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <AppText
                  variant="labelSmall"
                  color={active ? tokens.colors.onSecondary : tokens.colors.textMuted}
                  style={styles.chipLabel}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.preview}>
          <AppText style={styles.previewLabel}>
            WHAT YOU'LL SEE AT {displayTime} {period}
          </AppText>
          <View style={styles.notification}>
            <AppText variant="bodySmall" style={styles.notifTitle}>
              Still tired of feeling stuck?
            </AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              15 pages tonight. Day 4 of 18.
            </AppText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save reminder" onPress={handleSave} loading={isSaving} />
        <Button label="Notifications are optional — skip for now" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    paddingTop: tokens.spacing.xs,
    paddingBottom: tokens.spacing.md,
  },
  content: {
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.base,
  },
  lead: {
    gap: tokens.spacing.sm,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: tokens.spacing.lg,
  },
  // Figma: Instrument Serif 56.
  bigTime: {
    fontFamily: tokens.fonts.heroMobile.family,
    fontSize: 56,
    letterSpacing: -1.12,
    color: tokens.colors.text,
  },
  period: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelButton.size,
    letterSpacing: 1,
    color: tokens.colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: tokens.colors.secondary,
  },
  chipLabel: {
    letterSpacing: 0,
  },
  preview: {
    gap: tokens.spacing.sm,
  },
  previewLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 10,
    letterSpacing: 1,
    color: tokens.colors.textMuted,
  },
  notification: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: 8,
    padding: tokens.spacing.base,
    gap: tokens.spacing.xs,
    ...tokens.shadows.card,
  },
  notifTitle: {
    fontFamily: tokens.fonts.labelButton.family,
  },
  footer: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
});
