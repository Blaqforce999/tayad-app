import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
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
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={20} color={tokens.colors.secondary} />
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            Back
          </AppText>
        </Pressable>

        <AppText style={styles.title}>Reflection journal</AppText>

        {entries && entries.length === 0 ? (
          <EmptyState
            icon="create-outline"
            title="Nothing here yet"
            body="The thoughts you write during daily check-ins collect here."
          />
        ) : (
          <>
            <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.sectionLabel}>
              YOUR PAST REFLECTIONS
            </AppText>
            {(entries ?? []).map((entry) => (
              <View key={`${entry.date}-${entry.text.slice(0, 12)}`} style={styles.card}>
                <View style={styles.meta}>
                  <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.date}>
                    {formatShortDate(entry.date)}
                  </AppText>
                  <AppText variant="labelSmall" color={tokens.colors.secondary}>
                    Your note
                  </AppText>
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
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    color: tokens.colors.text,
  },
  sectionLabel: {
    letterSpacing: 1,
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
  date: {
    fontFamily: tokens.fonts.labelButton.family,
  },
});
