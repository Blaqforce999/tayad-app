import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tokens } from '@/lib/tokens';

type SkeletonProps = {
  height: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
};

// A flat placeholder block at Surface Container High. The shimmer animation is a
// follow-up; a static fill already reads as "loading" and respects reduced motion.
export function Skeleton({ height, width = '100%', radius = tokens.radii.card, style }: SkeletonProps) {
  return <View style={[styles.block, { height, width, borderRadius: radius }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
});
