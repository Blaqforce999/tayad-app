import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { purchaseOptions } from '@/lib/books';
import { fetchBookById, type CatalogueBook } from '@/lib/catalogue';
import { DEFAULT_DAILY_PAGES, planTotalDays } from '@/lib/plan';
import { setPlanDraft } from '@/lib/plan-draft';
import { findPick, getRecommendationSession } from '@/lib/session-store';
import { resolveSources } from '@/lib/books';
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
    return <Screen style={styles.screen}><View /></Screen>;
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
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={20} color={tokens.colors.secondary} />
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            Back
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
          <AppText variant="labelSmall" color={tokens.colors.secondary}>
            {book.author}
          </AppText>
          <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.pages}>
            {book.pageCount} pages
          </AppText>
        </View>

        <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.sectionLabel}>
          WHERE TO READ IT
        </AppText>

        {sources.isFree && sources.freeSourceUrl ? (
          <Pressable
            style={styles.freeCard}
            onPress={() => open(sources.freeSourceUrl)}
            accessibilityRole="button"
          >
            <View style={styles.freeHeader}>
              <View style={styles.freeTitle}>
                <Ionicons name="checkmark-circle" size={22} color={tokens.colors.tertiary} />
                <AppText variant="labelButton">Free digital edition</AppText>
              </View>
              <AppText variant="labelSmall" color={tokens.colors.secondary}>
                Included
              </AppText>
            </View>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              Open your free legal copy and start reading now.
            </AppText>
          </Pressable>
        ) : null}

        <View style={styles.buyGroup}>
          <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.sectionLabel}>
            BUY FROM BOOKSELLERS
          </AppText>
          {purchaseOptions(sources).map((option) => (
            <Pressable
              key={option.label}
              style={styles.sourceRow}
              onPress={() => open(option.url)}
              accessibilityRole="button"
            >
              <AppText variant="bodyLarge">{option.label}</AppText>
              <View style={styles.sourceMeta}>
                <AppText variant="labelSmall" color={tokens.colors.secondary}>
                  Open
                </AppText>
                <Ionicons name="open-outline" size={14} color={tokens.colors.secondary} />
              </View>
            </Pressable>
          ))}

          <Pressable style={styles.sourceRow} onPress={startPlanSetup} accessibilityRole="button">
            <AppText variant="bodyLarge">I already have this book</AppText>
            <Ionicons name="chevron-forward" size={16} color={tokens.colors.secondary} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Start reading plan" onPress={startPlanSetup} />
        <AppText variant="overline" color={tokens.colors.secondary} style={styles.center}>
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
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.base,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    alignSelf: 'flex-start',
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
  pages: {
    opacity: 0.6,
  },
  sectionLabel: {
    letterSpacing: 1,
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
  buyGroup: {
    gap: tokens.spacing.sm,
  },
  sourceRow: {
    minHeight: 52,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.primary,
    backgroundColor: tokens.colors.surfaceContainer,
    paddingHorizontal: tokens.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  footer: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
});
