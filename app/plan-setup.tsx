import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { SectionIntro } from '@/components/shared/SectionIntro';
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
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionIntro
          overline={draft.title}
          title="Make it small enough to keep"
          subtitle="Set a daily reading goal you'll actually stick to."
          titleFace="sans"
        />

        <View style={styles.card}>
          <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.cardLabel}>
            DAILY GOAL
          </AppText>
          <AppText variant="displayLarge">{dailyPages} pages</AppText>
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
            At {dailyPages} pages a day, you'll finish in{' '}
            <AppText variant="bodySmall" style={styles.calcStrong}>
              {days} days.
            </AppText>
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.reminderRow}>
          <AppText variant="bodyLarge">Reminder time</AppText>
          <AppText variant="labelSmall" color={tokens.colors.secondary}>
            8:30 PM
          </AppText>
        </View>

        {error ? (
          <AppText variant="bodySmall" color={tokens.colors.error}>
            {error}
          </AppText>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Start reading plan" onPress={handleStart} loading={isSubmitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  content: {
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.base,
  },
  card: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.md,
    ...tokens.shadows.card,
  },
  cardLabel: {
    letterSpacing: 1,
  },
  stepper: {
    gap: tokens.spacing.md,
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
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
  reminderRow: {
    minHeight: 52,
    borderRadius: tokens.radii.input,
    backgroundColor: tokens.colors.surfaceContainer,
    paddingHorizontal: tokens.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
  },
});
