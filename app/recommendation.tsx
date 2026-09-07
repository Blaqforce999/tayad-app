import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';

import { BookCard } from '@/components/recommendation/BookCard';
import { Screen } from '@/components/shared/Screen';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { AppText } from '@/components/ui/AppText';
import { getRecommendationSession } from '@/lib/session-store';
import { tokens } from '@/lib/tokens';

export default function RecommendationScreen() {
  const session = getRecommendationSession();

  // Deep-linked or reloaded without a live session — send them back to the input.
  if (!session || session.picks.length === 0) {
    return <Redirect href="/problem" />;
  }

  const [primary, ...rest] = session.picks;

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color={tokens.colors.secondary} />
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            Back
          </AppText>
        </Pressable>

        <SectionIntro
          overline="Your reads"
          title="Three books. One place to begin."
          subtitle="Chosen for what you shared. Tap any to see where to read it."
          titleFace="serif"
        />

        <BookCard
          book={primary.book}
          explanation={primary.explanation}
          variant="primary"
          onPress={() => router.push(`/book/${primary.book.id}`)}
        />

        {rest.length > 0 ? (
          <View style={styles.alsoFor}>
            <View style={styles.labelRow}>
              <View style={styles.line} />
              <AppText variant="overline" color={tokens.colors.secondary}>
                Also for you
              </AppText>
              <View style={styles.line} />
            </View>

            {rest.map((pick) => (
              <BookCard
                key={pick.book.id}
                book={pick.book}
                explanation={pick.explanation}
                variant="secondary"
                onPress={() => router.push(`/book/${pick.book.id}`)}
              />
            ))}
          </View>
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
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    alignSelf: 'flex-start',
  },
  alsoFor: {
    gap: tokens.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
});
