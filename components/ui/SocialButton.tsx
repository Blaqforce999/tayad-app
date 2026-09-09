import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import AppleLogo from '@/assets/brand/apple.svg';
import GoogleLogo from '@/assets/brand/google.svg';
import { tokens } from '@/lib/tokens';

import { AppText } from './AppText';

type Provider = 'apple' | 'google';

type SocialButtonProps = {
  provider: Provider;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const CONFIG: Record<
  Provider,
  { label: string; Logo: typeof AppleLogo; background: string; foreground: string }
> = {
  apple: {
    label: 'Continue with Apple',
    Logo: AppleLogo,
    background: tokens.colors.text,
    foreground: tokens.colors.onSecondary,
  },
  google: {
    label: 'Continue with Google',
    Logo: GoogleLogo,
    background: tokens.colors.surfaceRaised,
    foreground: tokens.colors.text,
  },
};

export function SocialButton({ provider, onPress, disabled = false, style }: SocialButtonProps) {
  const { label, Logo, background, foreground } = CONFIG[provider];
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.timing(scale, { toValue, duration: 120, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.base,
            { backgroundColor: background, transform: [{ scale }] },
            pressed && styles.pressed,
            disabled && styles.disabled,
            style,
          ]}
        >
          <View style={styles.icon}>
            <Logo width={24} height={24} />
          </View>
          <AppText style={[styles.label, { color: foreground }]}>{label}</AppText>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: tokens.radii.pill,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.md,
    // Figma Shadow/xs on the social button: 0 1 2 rgba(16,24,40,0.05).
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma spec: Manrope SemiBold 14 — no exact type token (labelButton is 16).
  label: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 14,
    lineHeight: 24,
    letterSpacing: tokens.fonts.labelButton.letterSpacing,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.38,
  },
});
