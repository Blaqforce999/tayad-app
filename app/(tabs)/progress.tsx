import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

import { ProgressBar } from '@/components/reading/ProgressBar';
import { StreakBadge } from '@/components/reading/StreakBadge';
import { StatCard } from '@/components/progress/StatCard';
import { TrendChart } from '@/components/progress/TrendChart';
import { EmptyState } from '@/components/shared/EmptyState';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { fetchBooksFinished, fetchDailySeries, fetchWeekTrend } from '@/lib/progress';
import { tokens } from '@/lib/tokens';

import { usePlan } from '@/hooks/usePlan';
import { useStreak } from '@/hooks/useStreak';

export default function ProgressScreen() {
  const { plan, isLoading } = usePlan();
  const { streak } = useStreak();
  const [booksFinished, setBooksFinished] = useState(0);
  const [trend, setTrend] = useState<number | null>(null);
  const [series, setSeries] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchBooksFinished()
        .then((count) => active && setBooksFinished(count))
        .catch(() => undefined);
      fetchWeekTrend(plan?.dailyPages ?? 15)
        .then((value) => active && setTrend(value))
        .catch(() => undefined);
      fetchDailySeries()
        .then((values) => active && setSeries(values))
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, [plan?.dailyPages]),
  );

  if (isLoading) {
    return (
      <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <View />
      </Screen>
    );
  }

  const hasHistory = Boolean(plan) || booksFinished > 0 || streak.count > 0;

  if (!hasHistory) {
    return (
      <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <View style={styles.emptyContent}>
          <AppText style={styles.title}>Progress</AppText>
          <View style={styles.emptyBody}>
            <View style={styles.ring}>
              <Svg width={160} height={160}>
                <Circle
                  cx={80}
                  cy={80}
                  r={72}
                  stroke={tokens.colors.surfaceContainerHigh}
                  strokeWidth={16}
                  fill="none"
                />
              </Svg>
              <View style={styles.ringBadge}>
                <Feather name="bookmark" size={24} color={tokens.colors.onPrimary} />
              </View>
            </View>
            <EmptyState
              hideIcon
              title="Day one starts here"
              body="Choose a book. Your progress will appear here."
            />
            <Button label="Find my first book" onPress={() => router.push('/problem')} />
          </View>
        </View>
      </Screen>
    );
  }

  const planPct = plan && plan.totalPages ? plan.pagesRead / plan.totalPages : 0;

  return (
    <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText style={styles.title}>Progress</AppText>

        <StreakBadge count={streak.count} style={styles.badge} />

        {plan ? (
          <Pressable
            style={styles.card}
            onPress={() => router.push('/reading-history')}
            accessibilityRole="button"
          >
            <View style={styles.cardHeader}>
              <AppText style={styles.cardLabel}>Current plan</AppText>
              <AppText style={styles.percent}>{Math.round(planPct * 100)}%</AppText>
            </View>
            <ProgressBar value={planPct} />
            <View style={styles.cardMeta}>
              <AppText style={styles.metaText}>
                {plan.book.title} · {plan.dailyPages} pages/day
              </AppText>
              <Feather name="arrow-right" size={16} color={tokens.colors.secondary} />
            </View>
          </Pressable>
        ) : null}

        <View style={styles.statsRow}>
          <StatCard label="Longest streak" value={String(streak.longest)} sublabel="days in a row" />
          <StatCard label="Books finished" value={String(booksFinished)} sublabel="all time" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText style={styles.cardLabel}>Reading trend</AppText>
            {trend !== null ? (
              <AppText style={styles.percent}>
                {trend >= 0 ? '+' : ''}
                {trend}%
              </AppText>
            ) : (
              <AppText style={styles.metaText}>Just getting started</AppText>
            )}
          </View>
          {series.length > 0 ? <TrendChart data={series} /> : null}
          <AppText style={styles.metaText}>Pages read this week vs last week</AppText>
        </View>

        <Pressable
          style={styles.linkRow}
          onPress={() => router.push('/reflection-journal')}
          accessibilityRole="button"
        >
          <AppText variant="bodySmall" color={tokens.colors.primaryPressed}>
            See all reflections
          </AppText>
          <Feather name="chevron-right" size={16} color={tokens.colors.primaryPressed} />
        </Pressable>
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
  // Figma: Manrope Bold 24 / 1.15 (Bold -> SemiBold).
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  badge: {
    alignSelf: 'center',
  },
  card: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.md,
    ...tokens.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Figma: Manrope SemiBold 13, uppercase, secondary, +2% tracking.
  cardLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    letterSpacing: tokens.fonts.labelSmall.letterSpacing,
    textTransform: 'uppercase',
    color: tokens.colors.secondary,
  },
  // Figma: Manrope Bold 13, primary (amber). Bold -> SemiBold.
  percent: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.primary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Figma caption text: Manrope Regular 13, secondary.
  metaText: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.xs,
    paddingTop: tokens.spacing.sm,
  },
  emptyContent: {
    flex: 1,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.lg,
  },
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.lg,
    alignSelf: 'stretch',
  },
  ring: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBadge: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
