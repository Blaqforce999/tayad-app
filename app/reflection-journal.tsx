import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { fetchReflections, formatShortDate, type JournalEntry } from '@/lib/progress';
import { tokens } from '@/lib/tokens';

export default function ReflectionJournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);

  useEffect(() => {
    fetchReflections()
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

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

        <AppText style={styles.title}>Reflection journal</AppText>

        {entries && entries.length === 0 ? (
          <EmptyState
            variant="no-content"
            title="Nothing here yet"
            body="The thoughts you write during daily check-ins collect here."
          />
        ) : (
          <>
            <AppText style={styles.sectionLabel}>Your past reflections</AppText>
            {(entries ?? []).map((entry) => (
              <View key={`${entry.date}-${entry.text.slice(0, 12)}`} style={styles.card}>
                <View style={styles.meta}>
                  <AppText style={styles.date}>{formatShortDate(entry.date)}</AppText>
                  <AppText style={styles.noteLabel}>Your note</AppText>
                </View>
                <AppText variant="bodySmall">{entry.text}</AppText>
              </View>
            ))}
          </>
        )}
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
  // Figma: Manrope SemiBold 13, uppercase, secondary, +2% tracking.
  sectionLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    letterSpacing: tokens.fonts.labelSmall.letterSpacing,
    textTransform: 'uppercase',
    color: tokens.colors.secondary,
  },
  card: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.sm,
    ...tokens.shadows.card,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Figma: date Manrope SemiBold 13 secondary.
  date: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
  // Figma: "Your note" Manrope Regular 13 secondary.
  noteLabel: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
});
