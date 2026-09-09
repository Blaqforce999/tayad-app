import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { BackHeader } from '@/components/shared/BackHeader';
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
      <BackHeader title="Reading reminder" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.lead}>
          <AppText style={styles.leadTitle}>When should we nudge you?</AppText>
          <AppText style={styles.leadSub}>
            We&apos;ll phrase it around what you&apos;re tired of, never the book title.
          </AppText>
        </View>

        <View style={styles.timeCard}>
          <AppText style={styles.bigTime}>{displayTime}</AppText>
          <AppText style={styles.period}>{period}</AppText>
        </View>

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
                  style={[
                    styles.chipLabel,
                    { color: active ? tokens.colors.surfaceRaised : tokens.colors.textMuted },
                  ]}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.preview}>
          <AppText style={styles.previewLabel}>
            WHAT YOU&apos;LL SEE AT {displayTime} {period}
          </AppText>
          <View style={styles.notification}>
            <AppText style={styles.notifTitle}>Still tired of feeling stuck?</AppText>
            <AppText style={styles.notifBody}>15 pages tonight. Day 4 of 18.</AppText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save reminder" onPress={handleSave} loading={isSaving} />
        <Pressable
          style={styles.skip}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <AppText style={styles.skipLabel}>Notifications are optional - skip for now</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  content: {
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.base,
  },
  lead: {
    gap: tokens.spacing.sm,
  },
  // Figma: Instrument Serif 26 / 1.15.
  leadTitle: {
    fontFamily: tokens.fonts.displayMedium.family,
    fontSize: 26,
    lineHeight: 26 * 1.15,
    letterSpacing: -0.26,
    color: tokens.colors.text,
  },
  // Figma: Manrope Regular 14 / 1.6, secondary.
  leadSub: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: tokens.fonts.bodySmall.size * 1.6,
    color: tokens.colors.secondary,
  },
  timeCard: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: tokens.radii.card,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.lg,
    ...tokens.shadows.card,
  },
  // Figma: Instrument Serif 56. Explicit line box so MIUI renders it filled,
  // not stroked.
  bigTime: {
    fontFamily: tokens.fonts.heroMobile.family,
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -1.12,
    color: tokens.colors.text,
  },
  // Figma: Manrope SemiBold 16, dust, +6% tracking.
  period: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelButton.size,
    lineHeight: 22,
    letterSpacing: 0.96,
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
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: tokens.colors.secondary,
  },
  // Figma: Manrope SemiBold 13.
  chipLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    lineHeight: 18,
    letterSpacing: 0,
  },
  preview: {
    gap: tokens.spacing.sm,
  },
  // Figma: Manrope SemiBold 10, dust, +1px tracking.
  previewLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    color: tokens.colors.textMuted,
  },
  notification: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.divider,
    padding: tokens.spacing.base,
    gap: tokens.spacing.xs,
    ...tokens.shadows.card,
  },
  // Figma: Manrope Medium 14.
  notifTitle: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: 20,
    color: tokens.colors.text,
  },
  // Figma: Manrope Regular 14, muted.
  notifBody: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: 20,
    color: tokens.colors.secondary,
  },
  footer: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.xs,
    gap: tokens.spacing.md,
  },
  skip: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma: Manrope Medium 14, dust.
  skipLabel: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: 20,
    color: tokens.colors.textMuted,
  },
});
