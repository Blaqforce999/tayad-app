import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { BackHeader } from '@/components/shared/BackHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import {
  DAILY_PAGES_STEP,
  MAX_DAILY_PAGES,
  MIN_DAILY_PAGES,
  clampDailyPages,
  daysRemaining,
  pagesRemaining,
} from '@/lib/plan';
import { updateDailyPages } from '@/lib/plans';
import { tokens } from '@/lib/tokens';

import { usePlan } from '@/hooks/usePlan';

export default function DailyGoalScreen() {
  const { plan, refresh } = usePlan();
  const [dailyPages, setDailyPages] = useState(() => plan?.dailyPages ?? 15);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) {
    return <Redirect href="/(tabs)/settings" />;
  }

  const left = pagesRemaining(plan.pagesRead, plan.totalPages);
  const days = daysRemaining(plan.pagesRead, plan.totalPages, dailyPages);
  const step = (delta: number) => setDailyPages((current) => clampDailyPages(current + delta));

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await updateDailyPages(plan.id, dailyPages, plan.totalPages);
      await refresh();
      router.back();
    } catch {
      setIsSaving(false);
      setError('Could not save that. Try again in a moment.');
    }
  };

  return (
    <Screen style={styles.screen}>
      <BackHeader title="Daily page goal" />

      <View style={styles.body}>
        <View style={styles.lead}>
          <AppText variant="displayMedium">Still small enough to keep?</AppText>
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            Change the pace any time. Nothing you have already read is lost.
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText style={styles.cardLabel}>Daily goal</AppText>
          <AppText style={styles.goalValue}>{dailyPages} pages</AppText>
          <View style={styles.stepper}>
            <Pressable
              style={[styles.stepButton, dailyPages <= MIN_DAILY_PAGES && styles.stepDisabled]}
              onPress={() => step(-DAILY_PAGES_STEP)}
              disabled={dailyPages <= MIN_DAILY_PAGES}
              accessibilityRole="button"
              accessibilityLabel="Fewer pages"
            >
              <Ionicons name="remove" size={20} color={tokens.colors.text} />
            </Pressable>
            <Pressable
              style={[styles.stepButton, dailyPages >= MAX_DAILY_PAGES && styles.stepDisabled]}
              onPress={() => step(DAILY_PAGES_STEP)}
              disabled={dailyPages >= MAX_DAILY_PAGES}
              accessibilityRole="button"
              accessibilityLabel="More pages"
            >
              <Ionicons name="add" size={20} color={tokens.colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.calcRow}>
          <Ionicons name="flash" size={16} color={tokens.colors.secondary} />
          <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.calcText}>
            {left} pages left — you'll finish in{' '}
            <AppText variant="bodySmall" style={styles.calcStrong}>
              {days} days.
            </AppText>
          </AppText>
        </View>

        {error ? (
          <AppText variant="bodySmall" color={tokens.colors.error}>
            {error}
          </AppText>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button label="Save goal" onPress={handleSave} loading={isSaving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: tokens.spacing.base },
  body: { flex: 1, gap: tokens.spacing.base },
  lead: { gap: tokens.spacing.sm },
  card: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.md,
    ...tokens.shadows.card,
  },
  // Figma: Manrope SemiBold 13, uppercase, secondary, +2% tracking.
  cardLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    letterSpacing: tokens.fonts.labelSmall.letterSpacing,
    textTransform: 'uppercase',
    color: tokens.colors.secondary,
  },
  // Figma: Manrope Bold 28 (Bold -> SemiBold), not the serif token.
  goalValue: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayLarge.size,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  stepper: { gap: tokens.spacing.sm },
  stepButton: {
    minHeight: 48,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.card,
  },
  stepDisabled: { opacity: 0.38 },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.md,
  },
  calcText: { flex: 1 },
  calcStrong: { fontFamily: tokens.fonts.labelButton.family, color: tokens.colors.text },
  footer: { paddingVertical: tokens.spacing.sm },
});
