import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type StatCardProps = {
  label: string;
  value: string;
  sublabel: string;
  style?: ViewStyle;
};

export function StatCard({ label, value, sublabel, style }: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText style={styles.value}>{value}</AppText>
      <AppText style={styles.sublabel}>{sublabel}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.base,
    gap: tokens.spacing.xs,
    ...tokens.shadows.card,
  },
  // Figma: Manrope SemiBold 13, uppercase, secondary, +2% tracking.
  label: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.labelSmall.size,
    letterSpacing: tokens.fonts.labelSmall.letterSpacing,
    textTransform: 'uppercase',
    color: tokens.colors.secondary,
  },
  // Figma: Manrope Bold 24 (Bold -> SemiBold), not the serif token.
  value: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  // Figma: Manrope Regular 13, secondary.
  sublabel: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
});
