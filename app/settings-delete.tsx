import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { fetchDeletionSummary, type DeletionSummary } from '@/lib/settings';
import { tokens } from '@/lib/tokens';

export default function SettingsDeleteScreen() {
  const [summary, setSummary] = useState<DeletionSummary | null>(null);

  useEffect(() => {
    fetchDeletionSummary()
      .then(setSummary)
      .catch(() => setSummary({ problems: 0, booksFinished: 0, reflections: 0, streak: 0 }));
  }, []);

  const lines = summary
    ? [
        { value: summary.problems, label: 'problems you told us about' },
        { value: summary.booksFinished, label: 'books finished' },
        { value: summary.reflections, label: 'private reflections' },
        { value: summary.streak, label: 'day streak' },
      ]
    : [];

  // Real deletion needs the delete-account Edge Function (service role key to
  // remove the auth user + cascade). That's parked with the other functions.
  const handleDelete = () => {
    Alert.alert(
      'Not yet',
      'Account deletion is being finalised. Email hello@tayad.app and we will remove everything within 48 hours.',
    );
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.icon}>
          <Ionicons name="trash-outline" size={24} color={tokens.colors.secondary} />
        </View>

        <View style={styles.textBlock}>
          <AppText variant="displayMedium" style={styles.center}>
            Delete everything?
          </AppText>
          <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.center}>
            This cannot be undone. Here's exactly what goes:
          </AppText>
        </View>

        <View style={styles.summary}>
          {lines.map((line, index) => (
            <View key={line.label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.summaryLine}>
                <AppText style={styles.summaryValue}>{line.value}</AppText>
                <AppText variant="bodySmall" color={tokens.colors.textMuted} style={styles.summaryLabel}>
                  {line.label}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
            accessibilityRole="button"
          >
            <AppText variant="labelButton" color={tokens.colors.onSecondary}>
              Delete my account
            </AppText>
          </Pressable>
          <Button label="Keep my account" variant="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  sheet: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.base,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  summary: {
    alignSelf: 'stretch',
    backgroundColor: tokens.colors.surfaceContainer,
    borderRadius: tokens.radii.card,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.sm,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.base,
    paddingVertical: tokens.spacing.md,
  },
  summaryValue: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 20,
    color: tokens.colors.text,
  },
  summaryLabel: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    opacity: 0.5,
  },
  actions: {
    alignSelf: 'stretch',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
  // One-off: an error-filled destructive-confirmation button (sanctioned use of
  // the error colour per design-system.md), not a general Button variant.
  deleteButton: {
    minHeight: 48,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    ...tokens.shadows.elevated,
  },
});
