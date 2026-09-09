import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { tokens } from '@/lib/tokens';

import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

// Rest fill and one-step-dimmer pressed fill, per the locked interaction states.
// Figma's Button component: primary = amber, secondary = surface-container,
// ghost = surface-raised (white). Label is always deep ink.
const FILL: Record<ButtonVariant, string> = {
  primary: tokens.colors.primary,
  secondary: tokens.colors.surfaceContainer,
  ghost: tokens.colors.surfaceRaised,
};

const PRESSED_FILL: Record<ButtonVariant, string> = {
  primary: tokens.colors.primaryPressed,
  secondary: tokens.colors.surfaceContainerHigh,
  ghost: tokens.colors.surfaceContainerHigh,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isInactive = disabled || loading;

  const animateTo = (toValue: number) => {
    Animated.timing(scale, { toValue, duration: 120, useNativeDriver: true }).start();
  };

  // Disabled buttons carry no shadow; ghost never does.
  const shadow =
    isInactive || variant === 'ghost'
      ? null
      : variant === 'primary'
        ? tokens.shadows.elevated
        : tokens.shadows.card;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.base,
            shadow,
            { backgroundColor: pressed && !isInactive ? PRESSED_FILL[variant] : FILL[variant] },
            { transform: [{ scale }] },
            isInactive && styles.inactive,
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={tokens.colors.text} />
          ) : (
            <AppText variant="labelButton" style={styles.label}>
              {label}
            </AppText>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Figma Button: min-h 48, px 16, py 12, pill. The vertical padding also gives
  // descenders ("Sign out", "Log in") room so the centred label never clips.
  base: {
    minHeight: 48,
    borderRadius: tokens.radii.pill,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    // Explicit, roomy line box: RN clips descenders ("g", "y") on a tight box.
    lineHeight: 22,
  },
  inactive: {
    opacity: 0.38,
  },
});
