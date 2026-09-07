import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tokens } from '@/lib/tokens';

type ProgressBarProps = {
  // 0..1
  value: number;
  style?: ViewStyle;
};

export function ProgressBar({ value, style }: ProgressBarProps) {
  const pct = `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%` as const;

  return (
    <View style={[styles.track, style]}>
      {/* Sage is the progress colour (design system) — deliberately not amber. */}
      <View style={[styles.fill, { width: pct }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: tokens.spacing.sm,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.tertiary,
  },
});
