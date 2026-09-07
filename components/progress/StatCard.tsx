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
      <AppText variant="labelSmall" color={tokens.colors.secondary} style={styles.label}>
        {label}
      </AppText>
      <AppText style={styles.value}>{value}</AppText>
      <AppText variant="labelSmall" color={tokens.colors.secondary}>
        {sublabel}
      </AppText>
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
  label: {
    letterSpacing: 1,
  },
  // Figma pairs display-medium size with Manrope Bold for these numbers.
  value: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    color: tokens.colors.text,
  },
});
