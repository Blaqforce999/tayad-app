import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { purchaseOptions, resolveSources } from '@/lib/books';
import { fetchBookById, type CatalogueBook } from '@/lib/catalogue';
import { DEFAULT_DAILY_PAGES, planTotalDays } from '@/lib/plan';
import { setPlanDraft } from '@/lib/plan-draft';
import { findPick, getRecommendationSession } from '@/lib/session-store';
import { tokens } from '@/lib/tokens';

export default function BookSelectedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pick = id ? findPick(id) : undefined;
  const [book, setBook] = useState<CatalogueBook | null>(pick?.book ?? null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (book || !id) {
      return;
    }
    fetchBookById(id)
      .then((result) => (result ? setBook(result) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [book, id]);

  if (notFound) {
    return <Redirect href="/problem" />;
  }
  if (!book) {
    return (
      <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <View />
      </Screen>
    );
  }

  const sources = pick?.sources ?? resolveSources(book);
  const session = getRecommendationSession();
  const previewDays = planTotalDays(book.pageCount, DEFAULT_DAILY_PAGES);

  const open = (url?: string) => {
    if (url) {
      void Linking.openURL(url);
    }
  };

  const startPlanSetup = () => {
    setPlanDraft({
      bookId: book.id,
      totalPages: book.pageCount,
      recommendationId: session?.recommendationId ?? null,
      chosenRank: pick?.rank ?? 1,
      title: book.title,
    });
    router.push('/plan-setup');
  };

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

        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroFallback]}>
            <Ionicons name="book-outline" size={40} color={tokens.colors.textMuted} />
          </View>
        )}

        <View style={styles.identity}>
          <AppText variant="displayMedium" style={styles.center}>
            {book.title}
          </AppText>
          <AppText style={styles.metaText}>{book.author}</AppText>
          <AppText style={[styles.metaText, styles.pages]}>{book.pageCount} pages</AppText>
        </View>

        <View style={styles.accessSection}>
          {sources.isFree && sources.freeSourceUrl ? (
            <>
              <AppText style={styles.sectionLabel}>Where to read it</AppText>
              <Pressable
                style={styles.freeCard}
                onPress={() => open(sources.freeSourceUrl)}
                accessibilityRole="button"
              >
                <View style={styles.freeHeader}>
                  <View style={styles.freeTitle}>
                    <Ionicons name="checkmark-circle" size={24} color={tokens.colors.tertiary} />
                    <AppText variant="labelButton">Free digital edition</AppText>
                  </View>
                  <AppText style={styles.metaText}>Included</AppText>
                </View>
                <AppText style={styles.freeDescription}>
                  Start reading instantly with your free digital copy.
                </AppText>
              </Pressable>
            </>
          ) : (
            <>
              <AppText style={styles.sectionLabel}>Available from these booksellers</AppText>
              <View style={styles.freeCard}>
                <AppText variant="labelButton">No free edition available</AppText>
                <AppText style={styles.freeDescription}>
                  This title is available for purchase from your favorite booksellers.
                </AppText>
              </View>
            </>
          )}

          <View style={styles.buyGroup}>
            {sources.isFree && sources.freeSourceUrl ? (
              <AppText style={styles.sectionLabel}>Buy from books sellers</AppText>
            ) : null}
            <View style={styles.sourceList}>
              {purchaseOptions(sources).map((option) => (
                <Pressable
                  key={option.label}
                  style={styles.sourceRow}
                  onPress={() => open(option.url)}
                  accessibilityRole="button"
                >
                  <AppText variant="bodyLarge">{option.label}</AppText>
                  <View style={styles.sourceMeta}>
                    <AppText style={styles.metaText}>Open </AppText>
                    <Feather name="arrow-up-right" size={14} color={tokens.colors.secondary} />
                  </View>
                </Pressable>
              ))}

              <Pressable style={styles.sourceRow} onPress={startPlanSetup} accessibilityRole="button">
                <AppText variant="bodyLarge">I already have this book</AppText>
                <Feather name="chevron-right" size={16} color={tokens.colors.secondary} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Start reading plan" onPress={startPlanSetup} />
        <AppText style={styles.dailyPace}>
          {DEFAULT_DAILY_PAGES} pages a day · finish in {previewDays} days
        </AppText>
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
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: tokens.spacing.sm,
    paddingRight: tokens.spacing.md,
  },
  hero: {
    width: '100%',
    height: 240,
    borderRadius: tokens.radii.card,
  },
  heroFallback: {
    backgroundColor: tokens.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  // Figma pairs 13px with Manrope Regular; label-small token is 13 Medium.
  metaText: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
    textAlign: 'center',
  },
  pages: {
    opacity: 0.6,
  },
  accessSection: {
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
  freeCard: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.sm,
    ...tokens.shadows.card,
  },
  freeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  freeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  freeDescription: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    lineHeight: tokens.fonts.labelSmall.size * 1.4,
    color: tokens.colors.secondary,
  },
  buyGroup: {
    gap: tokens.spacing.xs,
  },
  sourceList: {
    gap: tokens.spacing.sm,
  },
  sourceRow: {
    minHeight: 52,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
    backgroundColor: tokens.colors.surfaceContainer,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...tokens.shadows.card,
  },
  sourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: tokens.spacing.sm,
    gap: tokens.spacing.sm,
    alignItems: 'center',
  },
  // Figma daily-pace: Manrope Regular 11, secondary, centred (not the overline role).
  dailyPace: {
    fontFamily: tokens.fonts.bodyLarge.family,
    fontSize: tokens.fonts.overline.size,
    color: tokens.colors.secondary,
    textAlign: 'center',
  },
});
