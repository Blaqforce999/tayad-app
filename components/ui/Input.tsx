import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { tokens } from '@/lib/tokens';

import { AppText } from './AppText';

type InputProps = TextInputProps & {
  label: string;
  // Shown under the field in muted text; replaced by `error` when set.
  helperText?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export function Input({
  label,
  helperText,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  value,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Figma Input states (component 218:150388): default = surface-container,
  // focused/filled = white, error = surface-container-high. Every state carries
  // a 1px divider border.
  const hasError = Boolean(error);
  const isRaised = isFocused || Boolean(value);
  const fieldBackground = hasError
    ? tokens.colors.surfaceContainerHigh
    : isRaised
      ? tokens.colors.surfaceRaised
      : tokens.colors.surfaceContainer;
  return (
    <View style={[styles.container, containerStyle]}>
      <AppText style={styles.label}>{label}</AppText>

      <View style={[styles.field, { backgroundColor: fieldBackground }]}>
        <TextInput
          style={[styles.input, style]}
          value={value}
          placeholderTextColor={tokens.colors.secondary}
          accessibilityLabel={label}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </View>

      {error ? (
        <AppText variant="bodySmall" color={tokens.colors.error} style={styles.helper}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="bodySmall" color={tokens.colors.secondary} style={[styles.helper, styles.helperMuted]}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: tokens.spacing.xs,
  },
  // Figma spec: Manrope Medium 14 / 1.43, no tracking — no exact type token
  // (labelSmall is 13 +2%, bodySmall is 14 Regular), so it's composed here.
  label: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: tokens.fonts.bodySmall.size * 1.43,
    letterSpacing: 0,
    color: tokens.colors.secondary,
  },
  field: {
    minHeight: 52,
    borderRadius: tokens.radii.input,
    borderWidth: 1,
    borderColor: tokens.colors.divider,
    paddingHorizontal: tokens.spacing.base,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  input: {
    fontFamily: tokens.fonts.bodyLarge.family,
    fontSize: tokens.fonts.bodyLarge.size,
    // Figma input text: 16 / 1.5 (not the 1.6 body-large default).
    lineHeight: tokens.fonts.bodyLarge.size * 1.5,
    color: tokens.colors.text,
    paddingVertical: tokens.spacing.base,
  },
  helper: {},
  helperMuted: {
    opacity: 0.6,
  },
});
