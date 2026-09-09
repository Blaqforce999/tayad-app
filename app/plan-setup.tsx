import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import {
  DAILY_PAGES_STEP,
  DEFAULT_DAILY_PAGES,
  MAX_DAILY_PAGES,
  MIN_DAILY_PAGES,
  clampDailyPages,
  planTotalDays,
} from '@/lib/plan';
import { clearPlanDraft, getPlanDraft } from '@/lib/plan-draft';
import { startPlan } from '@/lib/plans';
import { clearRecommendationSession } from '@/lib/session-store';
import { tokens } from '@/lib/tokens';

import { usePlan } from '@/hooks/usePlan';

export default function PlanSetupScreen() {
  const draft = getPlanDraft();
  const { refresh } = usePlan();
  const [dailyPages, setDailyPages] = useState(DEFAULT_DAILY_PAGES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft) {
    return <Redirect href="/problem" />;
  }

  const days = planTotalDays(draft.totalPages, dailyPages);
  const step = (delta: number) => setDailyPages((current) => clampDailyPages(current + delta));

  const handleStart = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await startPlan({
        bookId: draft.bookId,
        recommendationId: draft.recommendationId,
        chosenRank: draft.chosenRank,
        totalPages: draft.totalPages,
        dailyPages,
      });
      clearPlanDraft();
      clearRecommendationSession();
      await refresh();
      router.replace('/');
    } catch {
      setIsSubmitting(false);
      setError('Could not start the plan. You may already have one active.');
    }
  };

  return (
    <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <AppText style={styles.title}>Make it small enough to keep</AppText>
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            Set a daily reading goal you&apos;ll actually stick to.
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
            At {dailyPages} pages a day, you&apos;ll finish in{' '}
            <AppText variant="bodySmall" style={styles.calcStrong}>
              {days} days.
            </AppText>
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.reminderRow}>
          <AppText variant="bodyLarge">Reminder time</AppText>
          <AppText style={styles.reminderValue}>8:30 PM</AppText>
        </View>

        {error ? (
          <AppText variant="bodySmall" color={tokens.colors.error}>
            {error}
          </AppText>
        ) : null}

        <Button label="Start reading plan" onPress={handleStart} loading={isSubmitting} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  content: {
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  heading: {
    gap: tokens.spacing.xs,
  },
  // Figma: Manrope Bold 24 / 1.15 (Bold -> SemiBold).
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
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
    lineHeight: 18,
    letterSpacing: tokens.fonts.labelSmall.letterSpacing,
    textTransform: 'uppercase',
    color: tokens.colors.secondary,
  },
  // Figma: Manrope Bold 28 (Bold -> SemiBold), not the serif display token.
  goalValue: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayLarge.size,
    lineHeight: 36,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  stepper: {
    gap: tokens.spacing.sm,
  },
  stepButton: {
    minHeight: 48,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.card,
  },
  stepDisabled: {
    opacity: 0.38,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.md,
  },
  calcText: {
    flex: 1,
  },
  calcStrong: {
    fontFamily: tokens.fonts.labelButton.family,
    color: tokens.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
  // Figma ListRow: column, label above value, radius 16, p16, min-h 52.
  reminderRow: {
    minHeight: 52,
    borderRadius: tokens.radii.input,
    backgroundColor: tokens.colors.surfaceContainer,
    padding: tokens.spacing.base,
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
  },
  reminderValue: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    lineHeight: 18,
    color: tokens.colors.secondary,
  },
});
