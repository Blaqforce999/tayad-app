import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { BackHeader } from '@/components/shared/BackHeader';
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
      <Feather
        name={positive ? 'check' : 'x'}
        size={positive ? 20 : 24}
        color={positive ? tokens.colors.tertiary : tokens.colors.secondary}
      />
      <AppText style={styles.itemText}>{text}</AppText>
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
      <BackHeader title="Your data" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppText style={styles.heroTitle}>Your problem is yours.</AppText>
          <AppText style={styles.heroSub}>
            No ads, no selling, no training on what you write here.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>What we keep</AppText>
          <View style={styles.card}>
            {KEEP.map((text) => (
              <DataItem key={text} text={text} positive />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>What we never keep</AppText>
          <View style={styles.card}>
            {NEVER_KEEP.map((text) => (
              <DataItem key={text} text={text} positive={false} />
            ))}
          </View>
        </View>

        <View style={styles.crisisNote}>
          <View style={styles.crisisIcon}>
            <Feather name="shield" size={20} color={tokens.colors.secondary} />
          </View>
          <AppText style={styles.crisisText}>
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
  content: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.lg,
  },
  hero: {
    gap: tokens.spacing.sm,
  },
  // Figma: Instrument Serif 26 / 1.15.
  heroTitle: {
    fontFamily: tokens.fonts.displayMedium.family,
    fontSize: 26,
    lineHeight: 26 * 1.15,
    letterSpacing: -0.26,
    color: tokens.colors.text,
  },
  // Figma: Manrope Regular 14 / 1.6, secondary.
  heroSub: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: tokens.fonts.bodySmall.size * 1.6,
    color: tokens.colors.secondary,
  },
  section: {
    gap: tokens.spacing.sm,
  },
  // Figma: Manrope SemiBold 11, dust, uppercase, +8% tracking.
  sectionLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.overline.size,
    letterSpacing: tokens.fonts.overline.letterSpacing,
    textTransform: 'uppercase',
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
  // Figma: Manrope Medium 14 / 1.55, on-surface.
  itemText: {
    flex: 1,
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: tokens.fonts.bodySmall.size * 1.55,
    letterSpacing: 0,
    color: tokens.colors.text,
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
  // Figma: Manrope Medium 13 / 1.55, secondary.
  crisisText: {
    flex: 1,
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    lineHeight: tokens.fonts.labelSmall.size * 1.55,
    letterSpacing: 0,
    color: tokens.colors.secondary,
  },
  // Figma footer: px 24 (Screen gives 16, +8 here), gap 12.
  footer: {
    paddingHorizontal: tokens.spacing.sm,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
    gap: tokens.spacing.md,
  },
  deleteRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.base,
  },
});
