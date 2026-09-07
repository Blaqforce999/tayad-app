import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tokens } from '@/lib/tokens';

type CardProps = {
  children: ReactNode;
  // 'standard' sits on the surface; 'raised' is white with a deeper shadow,
  // used for the recommendation cards.
  variant?: 'standard' | 'raised';
  style?: ViewStyle;
};

export function Card({ children, variant = 'standard', style }: CardProps) {
  return (
    <View
      style={[variant === 'raised' ? styles.raised : styles.standard, style]}
    >
      {children}
    </View>
  );
}

const base: ViewStyle = {
  borderRadius: tokens.radii.card,
  padding: tokens.spacing.cardPadding,
};

const styles = StyleSheet.create({
  standard: {
    ...base,
    backgroundColor: tokens.colors.surfaceContainer,
    ...tokens.shadows.card,
  },
  raised: {
    ...base,
    backgroundColor: tokens.colors.surfaceRaised,
    ...tokens.shadows.elevated,
  },
});
