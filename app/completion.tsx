import { ScrollView, StyleSheet, View } from 'react-native';

import { Redirect, router } from 'expo-router';

import { StreakBadge } from '@/components/reading/StreakBadge';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { clearCompletion, getCompletion } from '@/lib/completion-store';
import { tokens } from '@/lib/tokens';

export default function CompletionScreen() {
  const completion = getCompletion();

  if (!completion) {
    return <Redirect href="/" />;
  }

  const stats = [
    { value: String(completion.streakCount), label: 'days count' },
    { value: String(completion.pagesRead), label: 'pages read' },
    { value: String(completion.reflectionCount), label: 'reflections' },
  ];

  const restart = () => {
    clearCompletion();
    router.replace('/problem');
  };

  return (
    <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="overline" color={tokens.colors.secondary}>
          Book complete 🎉
        </AppText>

        <View style={styles.headline}>
          <AppText variant="displayLarge">You stayed with it.</AppText>
          <AppText variant="bodyLarge" color={tokens.colors.secondary}>
            You finished {completion.bookTitle} - and kept the promise you made to yourself.
          </AppText>
        </View>

        <StreakBadge
          count={completion.streakCount}
          label={completion.isBestStreak ? 'day streak - best yet' : 'day streak'}
          style={styles.badge}
        />

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <AppText style={styles.statValue}>{stat.value}</AppText>
              <AppText style={styles.statLabel}>{stat.label}</AppText>
            </View>
          ))}
        </View>

        <Button label="What are you tired of now?" onPress={restart} />
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
  headline: {
    gap: tokens.spacing.sm,
  },
  badge: {
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.xs,
  },
  // Figma: Manrope Bold 24 (Bold -> SemiBold), not the serif token.
  statValue: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  statLabel: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
});
