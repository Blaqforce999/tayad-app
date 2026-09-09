import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { ProgressBar } from '@/components/reading/ProgressBar';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import {
  fetchReadingHistory,
  formatShortDate,
  type HistoryPlan,
  type ReadingHistory,
} from '@/lib/progress';
import { tokens } from '@/lib/tokens';

import { usePlan } from '@/hooks/usePlan';

function HistoryRow({ plan, verb }: { plan: HistoryPlan; verb: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="labelButton">{plan.title}</AppText>
      <AppText style={styles.rowMeta}>
        {verb} · {formatShortDate(plan.date)}
      </AppText>
    </View>
  );
}

export default function ReadingHistoryScreen() {
  const { plan } = usePlan();
  const [history, setHistory] = useState<ReadingHistory>({ completed: [], setAside: [] });

  useEffect(() => {
    fetchReadingHistory()
      .then(setHistory)
      .catch(() => undefined);
  }, []);

  const currentPct = plan && plan.totalPages ? plan.pagesRead / plan.totalPages : 0;

  return (
    <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            ← Back
          </AppText>
        </Pressable>

        <AppText style={styles.title}>Reading history</AppText>

        {plan ? (
          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>Currently reading</AppText>
            <View style={styles.currentCard}>
              <View style={styles.currentHeader}>
                <View style={styles.currentTitle}>
                  <AppText variant="labelButton">{plan.book.title}</AppText>
                  <AppText style={styles.rowMeta}>
                    {plan.book.author} · Started {formatShortDate(plan.startDate)}
                  </AppText>
                </View>
                <AppText style={styles.percent}>{Math.round(currentPct * 100)}%</AppText>
              </View>
              <ProgressBar value={currentPct} />
            </View>
          </View>
        ) : null}

        {history.completed.length > 0 ? (
          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>
              {history.completed.length} book{history.completed.length === 1 ? '' : 's'} completed
            </AppText>
            {history.completed.map((item) => (
              <HistoryRow key={item.id} plan={item} verb="Finished" />
            ))}
          </View>
        ) : null}

        {history.setAside.length > 0 ? (
          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>{history.setAside.length} paused</AppText>
            {history.setAside.map((item) => (
              <HistoryRow key={item.id} plan={item} verb="Paused" />
            ))}
          </View>
        ) : null}

        {!plan && history.completed.length === 0 && history.setAside.length === 0 ? (
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            Nothing here yet. Your reading will show up once you start a plan.
          </AppText>
        ) : null}
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
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.base,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: tokens.spacing.sm,
    paddingRight: tokens.spacing.md,
  },
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  section: {
    gap: tokens.spacing.sm,
  },
  // Figma: Manrope SemiBold 13, uppercase, secondary, +2% tracking.
  sectionLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    letterSpacing: tokens.fonts.labelSmall.letterSpacing,
    textTransform: 'uppercase',
    color: tokens.colors.secondary,
  },
  currentCard: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.md,
    ...tokens.shadows.card,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  currentTitle: {
    flex: 1,
    gap: 2,
  },
  // Figma: Manrope Bold 16, primary (amber). Bold -> SemiBold.
  percent: {
    fontFamily: tokens.fonts.labelButton.family,
    color: tokens.colors.primary,
  },
  row: {
    minHeight: 52,
    borderRadius: tokens.radii.input,
    backgroundColor: tokens.colors.surfaceContainer,
    padding: tokens.spacing.base,
    justifyContent: 'space-between',
    gap: 2,
  },
  // Figma: Manrope Regular 13, secondary.
  rowMeta: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
});
