import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { BookCard } from '@/components/recommendation/BookCard';
import { ProgressBar } from '@/components/reading/ProgressBar';
import { StreakBadge } from '@/components/reading/StreakBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { hasForgivenessAvailable } from '@/lib/streak';
import { daysRemaining, pageRangeForDay, pagesRemaining } from '@/lib/plan';
import { checkInToday, completePlan } from '@/lib/plans';
import { fetchReflections } from '@/lib/progress';
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
    return (
      <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <View />
      </Screen>
    );
  }

  // --- No active plan: the invitation -------------------------------------
  if (!plan) {
    return (
      <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <ScrollView contentContainerStyle={styles.invitationContent} showsVerticalScrollIndicator={false}>
          <View style={styles.invitationCopy}>
            <AppText variant="displayMedium">Your next chapter starts with the truth.</AppText>
            <AppText variant="bodyLarge" color={tokens.colors.secondary}>
              Tell us what feels stuck, and we&apos;ll find a book worth finishing.
            </AppText>
          </View>
          <EmptyState icon="book" title="No book selected yet" body="Your next read is waiting." />
          <Button label="Find my book" onPress={() => router.push('/problem')} />
        </ScrollView>
      </Screen>
    );
  }

  // --- Active plan -------------------------------------------------------
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
        const reflectionCount = await fetchReflections()
          .then((rows) => rows.length)
          .catch(() => 0);
        setCompletion({
          bookTitle: plan.book.title,
          pagesRead: nextPagesRead,
          streakCount: nextStreak.count,
          isBestStreak: nextStreak.count >= nextStreak.longest,
          reflectionCount,
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

  const forgivenessAvailable = streak.count > 0 && hasForgivenessAvailable(streak);

  // --- Active plan, already checked in today ----------------------------
  if (plan.checkedInToday) {
    return (
      <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successHeader}>
            <AppText variant="overline" color={tokens.colors.secondary}>
              Reading done for today
            </AppText>
            <AppText style={styles.successTitle}>You showed up today.</AppText>
          </View>

          <StreakBadge count={streak.count} forgivenessAvailable={forgivenessAvailable} style={styles.centeredBadge} />

          <View style={styles.summaryCard}>
            <View style={styles.progressRow}>
              <AppText variant="bodySmall" color={tokens.colors.secondary}>
                Today&apos;s pages
              </AppText>
              <AppText variant="bodySmall" style={styles.progressValueStrong}>
                {plan.dailyPages} / {plan.dailyPages} complete
              </AppText>
            </View>
            <ProgressBar value={1} />
          </View>

          <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.tomorrow}>
            See you tomorrow · Pages {range.startPage}-{range.endPage}
          </AppText>
        </ScrollView>
      </Screen>
    );
  }

  // --- Active plan, today's reading + check-in --------------------------
  return (
    <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.todayInfo}>
            <AppText variant="overline" color={tokens.colors.secondary}>
              Today
            </AppText>
            <AppText variant="bodyLarge" style={styles.todayPages}>
              Pages {range.startPage}-{range.endPage}
            </AppText>
          </View>
          <StreakBadge count={streak.count} forgivenessAvailable={forgivenessAvailable} />
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
            <AppText style={styles.progressValue}>
              {plan.pagesRead} / {plan.totalPages} pages
            </AppText>
          </View>
          <ProgressBar value={plan.totalPages ? plan.pagesRead / plan.totalPages : 0} />
          <AppText style={styles.progressValue}>
            {left} pages left · ~{paceDays} days at this pace
          </AppText>
        </View>

        <Button label="Done reading for today" onPress={handleDone} loading={isCheckingIn} />

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
  // Active / checked-in: content gap 16, py 16 top (p16 in Figma).
  content: {
    flexGrow: 1,
    paddingTop: tokens.spacing.base,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  // No-plan invitation: gap 24, pt 24, pb 32.
  invitationContent: {
    flexGrow: 1,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  invitationCopy: {
    gap: tokens.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayInfo: {
    gap: tokens.spacing.xs,
  },
  // Figma "Pages 46-60": Manrope SemiBold 16.
  todayPages: {
    fontFamily: tokens.fonts.labelButton.family,
  },
  successHeader: {
    gap: tokens.spacing.sm,
  },
  // Figma: Manrope Bold 24 / 1.15 (Bold -> SemiBold).
  successTitle: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  centeredBadge: {
    alignSelf: 'center',
  },
  summaryCard: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.sm,
  },
  progressSection: {
    gap: tokens.spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Figma "Reading progress": Manrope SemiBold 14.
  progressLabel: {
    fontFamily: tokens.fonts.labelButton.family,
  },
  progressValueStrong: {
    fontFamily: tokens.fonts.labelButton.family,
    color: tokens.colors.text,
  },
  // Figma trailing / caption values: Manrope Regular 13, secondary.
  progressValue: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
  tomorrow: {
    textAlign: 'center',
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
});
