import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
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
    return <Screen edges={['top']} style={styles.screen}><View /></Screen>;
  }

  const hasHistory = Boolean(plan) || booksFinished > 0 || streak.count > 0;

  if (!hasHistory) {
    return (
      <Screen edges={['top']} style={styles.screen}>
        <View style={styles.emptyWrap}>
          <AppText style={styles.title}>Progress</AppText>
          <View style={styles.emptyBody}>
            <View style={styles.ring}>
              <Svg width={160} height={160}>
                <Circle
                  cx={80}
                  cy={80}
                  r={72}
                  stroke={tokens.colors.surfaceContainerHigh}
                  strokeWidth={9}
                  fill="none"
                />
              </Svg>
              <View style={styles.ringBadge}>
                <Ionicons name="bookmark" size={18} color={tokens.colors.onPrimary} />
              </View>
            </View>
            <EmptyState
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
    <Screen edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText style={styles.title}>Progress</AppText>

        <View style={styles.badgeWrap}>
          <StreakBadge count={streak.count} />
        </View>

        {plan ? (
          <Pressable
            style={styles.card}
            onPress={() => router.push('/reading-history')}
            accessibilityRole="button"
          >
            <View style={styles.cardHeader}>
              <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.cardLabel}>
                CURRENT PLAN
              </AppText>
              <AppText style={styles.percent}>{Math.round(planPct * 100)}%</AppText>
            </View>
            <ProgressBar value={planPct} />
            <View style={styles.cardMeta}>
              <AppText variant="labelSmall" color={tokens.colors.secondary}>
                {plan.book.title} · {plan.dailyPages} pages/day
              </AppText>
              <Ionicons name="arrow-forward" size={16} color={tokens.colors.secondary} />
            </View>
          </Pressable>
        ) : null}

        <View style={styles.statsRow}>
          <StatCard
            label="LONGEST STREAK"
            value={String(streak.longest)}
            sublabel="days in a row"
          />
          <StatCard
            label="BOOKS FINISHED"
            value={String(booksFinished)}
            sublabel="all time"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.cardLabel}>
              READING TREND
            </AppText>
            {trend !== null ? (
              <AppText style={styles.percent}>
                {trend >= 0 ? '+' : ''}
                {trend}%
              </AppText>
            ) : (
              <AppText variant="labelSmall" color={tokens.colors.secondary}>
                Just getting started
              </AppText>
            )}
          </View>
          {series.length > 0 ? <TrendChart data={series} /> : null}
          <AppText variant="labelSmall" color={tokens.colors.secondary}>
            Pages read this week vs last week
          </AppText>
        </View>

        <Pressable
          style={styles.linkRow}
          onPress={() => router.push('/reflection-journal')}
          accessibilityRole="button"
        >
          <AppText variant="bodySmall" color={tokens.colors.primaryPressed}>
            See all reflections
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={tokens.colors.primaryPressed} />
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
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    color: tokens.colors.text,
  },
  badgeWrap: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.base,
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
  cardLabel: {
    letterSpacing: 1,
  },
  percent: {
    fontFamily: tokens.fonts.labelButton.family,
    color: tokens.colors.primary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  emptyWrap: {
    flex: 1,
    paddingTop: tokens.spacing.lg,
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
