import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { buildDataExport } from '@/lib/settings';
import { tokens } from '@/lib/tokens';

const KEEP = [
  "What you're tired of, in your words",
  'Your reading plans and daily progress',
  'Your private reflections',
];

const NEVER_KEEP = [
  'Anything you type during a crisis check',
  'Your reading habits sold to anyone',
  'Payment details, because Tayad is free',
];

function DataItem({ text, positive }: { text: string; positive: boolean }) {
  return (
    <View style={styles.item}>
      <Ionicons
        name={positive ? 'checkmark' : 'close'}
        size={20}
        color={positive ? tokens.colors.primary : tokens.colors.textMuted}
      />
      <AppText variant="bodySmall" style={styles.itemText}>
        {text}
      </AppText>
    </View>
  );
}

export default function SettingsPrivacyScreen() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const json = await buildDataExport();
      await Share.share({ message: json, title: 'My Tayad data' });
    } catch {
      // User cancelled the share sheet, or the read failed — nothing to do.
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={tokens.colors.text} />
        </Pressable>
        <AppText variant="labelButton">Your data</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppText variant="displayMedium">Your problem is yours.</AppText>
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            No ads, no selling, no training on what you write here.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>WHAT WE KEEP</AppText>
          <View style={styles.card}>
            {KEEP.map((text) => (
              <DataItem key={text} text={text} positive />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>WHAT WE NEVER KEEP</AppText>
          <View style={styles.card}>
            {NEVER_KEEP.map((text) => (
              <DataItem key={text} text={text} positive={false} />
            ))}
          </View>
        </View>

        <View style={styles.crisisNote}>
          <View style={styles.crisisIcon}>
            <Ionicons name="shield-outline" size={20} color={tokens.colors.secondary} />
          </View>
          <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.crisisText}>
            Crisis wording is checked on your phone. That text never reaches our servers.
          </AppText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Export my data" variant="secondary" onPress={handleExport} loading={isExporting} />
        <Pressable
          style={styles.deleteRow}
          onPress={() => router.push('/settings-delete')}
          accessibilityRole="button"
        >
          <AppText variant="labelButton" color={tokens.colors.error}>
            Delete my account
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    paddingTop: tokens.spacing.xs,
    paddingBottom: tokens.spacing.md,
  },
  content: {
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.lg,
  },
  hero: {
    gap: tokens.spacing.sm,
  },
  section: {
    gap: tokens.spacing.sm,
  },
  sectionLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 11,
    letterSpacing: 1,
    color: tokens.colors.textMuted,
  },
  card: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.md,
    ...tokens.shadows.card,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.md,
  },
  itemText: {
    flex: 1,
  },
  crisisNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.surfaceContainer,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
  },
  crisisIcon: {
    width: 34,
    height: 34,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisText: {
    flex: 1,
    letterSpacing: 0,
  },
  footer: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
  deleteRow: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
