import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { deleteAccount } from '@/lib/account';
import { fetchDeletionSummary, type DeletionSummary } from '@/lib/settings';
import { tokens } from '@/lib/tokens';

export default function SettingsDeleteScreen() {
  const [summary, setSummary] = useState<DeletionSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const runDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // AuthContext sees the cleared session and the root redirects to /welcome.
      router.replace('/welcome');
    } catch {
      setIsDeleting(false);
      Alert.alert(
        'Could not delete',
        'Something went wrong. Try again, or email hello@tayad.app and we will remove everything.',
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete everything?',
      'This permanently erases your account and all your data. It cannot be undone.',
      [
        { text: 'Keep my account', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: runDelete },
      ],
    );
  };

  return (
    <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceRaised}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.icon}>
          <Feather name="trash-2" size={24} color={tokens.colors.error} />
        </View>

        <View style={styles.textBlock}>
          <AppText style={styles.title}>Delete everything?</AppText>
          <AppText style={styles.copy}>This cannot be undone. Here&apos;s exactly what goes:</AppText>
        </View>

        <View style={styles.summary}>
          {lines.map((line, index) => (
            <View key={line.label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.summaryLine}>
                <AppText style={styles.summaryValue}>{line.value}</AppText>
                <AppText style={styles.summaryLabel}>{line.label}</AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.deleteButton, isDeleting && styles.deleteButtonBusy]}
            onPress={handleDelete}
            disabled={isDeleting}
            accessibilityRole="button"
          >
            {isDeleting ? (
              <ActivityIndicator color={tokens.colors.onSecondary} />
            ) : (
              <AppText style={styles.deleteLabel}>Delete my account</AppText>
            )}
          </Pressable>
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <AppText variant="labelButton">Keep my account</AppText>
          </Pressable>
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
    alignItems: 'center',
    gap: tokens.spacing.base,
    paddingTop: tokens.spacing.md,
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
  // Figma: Instrument Serif 26 / 1.1.
  title: {
    fontFamily: tokens.fonts.displayMedium.family,
    fontSize: 26,
    lineHeight: 26 * 1.1,
    letterSpacing: -0.26,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  // Figma: Manrope Regular 14 / 1.6, secondary.
  copy: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: tokens.fonts.bodySmall.size * 1.6,
    color: tokens.colors.secondary,
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
  // Figma: Manrope Bold 20 (Bold -> SemiBold).
  summaryValue: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 20,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  // Figma: Manrope Medium 14 / 1.4, dust.
  summaryLabel: {
    flex: 1,
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: tokens.fonts.bodySmall.size * 1.4,
    color: tokens.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    opacity: 0.5,
  },
  actions: {
    alignSelf: 'stretch',
    gap: tokens.spacing.sm,
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
    paddingVertical: tokens.spacing.base,
    ...tokens.shadows.elevated,
  },
  deleteButtonBusy: {
    opacity: 0.7,
  },
  deleteLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelButton.size,
    lineHeight: 22,
    letterSpacing: tokens.fonts.labelButton.letterSpacing,
    color: tokens.colors.onSecondary,
  },
  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.base,
  },
});
