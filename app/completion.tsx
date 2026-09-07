import { ScrollView, StyleSheet, View } from 'react-native';

import { Redirect, router } from 'expo-router';

import { StreakBadge } from '@/components/reading/StreakBadge';
import { Screen } from '@/components/shared/Screen';
import { SectionIntro } from '@/components/shared/SectionIntro';
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
    { value: String(completion.streakCount), label: 'day streak' },
    { value: String(completion.pagesRead), label: 'pages read' },
  ];

  const restart = () => {
    clearCompletion();
    router.replace('/problem');
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionIntro
          overline="Book complete 🎉"
          title="You stayed with it."
          subtitle={`You finished ${completion.bookTitle} — and kept the promise you made to yourself.`}
          titleFace="serif"
        />

        <View style={styles.badgeWrap}>
          <StreakBadge
            count={completion.streakCount}
            label={completion.isBestStreak ? 'day streak · best yet' : 'day streak'}
          />
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <AppText variant="displayMedium">{stat.value}</AppText>
              <AppText variant="labelSmall" color={tokens.colors.secondary}>
                {stat.label}
              </AppText>
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
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  badgeWrap: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.base,
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
});
