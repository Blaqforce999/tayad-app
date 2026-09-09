import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { BookCard } from '@/components/recommendation/BookCard';
import { ProgressBar } from '@/components/reading/ProgressBar';
import { StreakBadge } from '@/components/reading/StreakBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Screen } from '@/components/shared/Screen';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { hasForgivenessAvailable } from '@/lib/streak';
import { daysRemaining, pageRangeForDay, pagesRemaining } from '@/lib/plan';
import { checkInToday, completePlan } from '@/lib/plans';
import { flushPending, queueCheckIn } from '@/lib/offline';
import { recordStreakCheckIn } from '@/lib/streaks';
import { setCompletion } from '@/lib/completion-store';
import { setReflectionContext } from '@/lib/reflection-store';
import { tokens } from '@/lib/tokens';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePlan } from '@/hooks/usePlan';
import { useStreak } from '@/hooks/useStreak';

export default function HomeScreen() {
  const { plan, isLoading, refresh } = usePlan();
  const { streak, refresh: refreshStreak } = useStreak();
  const { isOnline } = useNetworkStatus();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Replay a check-in that was queued while offline.
  useFocusEffect(
    useCallback(() => {
      if (!isOnline) {
        return;
      }
      flushPending().then((flushed) => {
        if (flushed) {
          void refresh();
          void refreshStreak();
        }
      });
    }, [isOnline, refresh, refreshStreak]),
  );

  if (isLoading) {
    return <Screen edges={['top']} style={styles.screen}><View /></Screen>;
  }

  // --- No active plan: the invitation -------------------------------------
  if (!plan) {
    return (
      <Screen edges={['top']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <SectionIntro
            overline="Today"
            title="Your next chapter starts with the truth."
            subtitle="Tell us what feels stuck, and we'll find a book worth finishing."
            titleFace="serif"
          />
          <EmptyState
            title="No book selected yet"
            body="Your next read is waiting."
          />
          <Button label="Find my book" onPress={() => router.push('/problem')} />
        </ScrollView>
      </Screen>
    );
  }

  // --- Active plan: today's reading + check-in ---------------------------
  const dayNumber = Math.min(
    Math.floor(plan.pagesRead / plan.dailyPages) + 1,
    plan.targetDays,
  );
  const range = pageRangeForDay(dayNumber, plan.dailyPages, plan.totalPages);
  const left = pagesRemaining(plan.pagesRead, plan.totalPages);
  const paceDays = daysRemaining(plan.pagesRead, plan.totalPages, plan.dailyPages);

  const handleDone = async () => {
    if (plan.checkedInToday) {
      return;
    }
    setIsCheckingIn(true);
    const nextPagesRead = Math.min(plan.pagesRead + plan.dailyPages, plan.totalPages);

    // Offline: queue it, tell the user it still counts, sync on reconnect.
    if (!isOnline) {
      await queueCheckIn(plan.id, nextPagesRead);
      setIsCheckingIn(false);
      router.push('/status?kind=offline-checkin');
      return;
    }

    try {
      await checkInToday({ planId: plan.id, pagesRead: nextPagesRead });
      const nextStreak = await recordStreakCheckIn();
      const finished = nextPagesRead >= plan.totalPages;
      if (finished) {
        await completePlan(plan.id);
      }
      await Promise.all([refresh(), refreshStreak()]);

      if (finished) {
        setCompletion({
          bookTitle: plan.book.title,
          pagesRead: nextPagesRead,
          streakCount: nextStreak.count,
          isBestStreak: nextStreak.count >= nextStreak.longest,
        });
        router.replace('/completion');
      } else {
        setReflectionContext({ planId: plan.id, problemHint: 'the way you get stuck' });
        router.push('/reflection');
      }
    } catch {
      router.push('/status?kind=error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Screen edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.todayInfo}>
            <AppText variant="overline" color={tokens.colors.secondary}>
              Today
            </AppText>
            <AppText variant="bodyLarge" style={styles.todayPages}>
              {plan.checkedInToday
                ? 'Done for today'
                : `Pages ${range.startPage}–${range.endPage}`}
            </AppText>
          </View>
          <StreakBadge
            count={streak.count}
            forgivenessAvailable={streak.count > 0 && hasForgivenessAvailable(streak)}
          />
        </View>

        <BookCard
          book={plan.book}
          explanation={plan.book.description ?? 'The book you chose to finish.'}
          variant="secondary"
          onPress={() => router.push(`/book/${plan.book.id}`)}
        />

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <AppText variant="bodySmall" style={styles.progressLabel}>
              Reading progress
            </AppText>
            <AppText variant="labelSmall" color={tokens.colors.secondary}>
              {plan.pagesRead} / {plan.totalPages} pages
            </AppText>
          </View>
          <ProgressBar value={plan.totalPages ? plan.pagesRead / plan.totalPages : 0} />
          <AppText variant="labelSmall" color={tokens.colors.secondary}>
            {left} pages left · ~{paceDays} days at this pace
          </AppText>
        </View>

        <Button
          label={plan.checkedInToday ? 'Checked in for today' : 'Done reading for today'}
          onPress={handleDone}
          loading={isCheckingIn}
          disabled={plan.checkedInToday}
        />

        <Pressable
          style={styles.updateRow}
          onPress={() => router.push('/update-pages')}
          accessibilityRole="button"
        >
          <Ionicons name="pencil" size={14} color={tokens.colors.secondary} />
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            Update page number
          </AppText>
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
    flexGrow: 1,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  todayInfo: {
    gap: tokens.spacing.xs,
    paddingTop: tokens.spacing.sm,
  },
  todayPages: {
    fontFamily: tokens.fonts.labelButton.family,
  },
  progressSection: {
    gap: tokens.spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: tokens.fonts.labelButton.family,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
});
