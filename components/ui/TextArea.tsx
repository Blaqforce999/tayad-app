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

type TextAreaProps = TextInputProps & {
  label: string;
  helperText?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

// Figma's TextArea keeps a 1px border — a tall field reads better bounded.
export function TextArea({
  label,
  helperText,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <AppText style={styles.label}>{label}</AppText>

      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={tokens.colors.secondary}
          accessibilityLabel={label}
          multiline
          textAlignVertical="top"
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
        <AppText variant="bodySmall" color={tokens.colors.error}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.helperMuted}>
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
  label: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    lineHeight: tokens.fonts.bodySmall.size * 1.43,
    letterSpacing: 0,
    color: tokens.colors.secondary,
  },
  field: {
    minHeight: 144,
    borderRadius: tokens.radii.input,
    borderWidth: 1,
    borderColor: tokens.colors.divider,
    backgroundColor: tokens.colors.surfaceContainer,
    padding: tokens.spacing.base,
  },
  fieldFocused: {
    backgroundColor: tokens.colors.surfaceRaised,
  },
  fieldError: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderColor: tokens.colors.error,
  },
  input: {
    flex: 1,
    fontFamily: tokens.fonts.bodyLarge.family,
    fontSize: tokens.fonts.bodyLarge.size,
    lineHeight: tokens.fonts.bodyLarge.size * tokens.fonts.bodyLarge.lineHeight,
    color: tokens.colors.text,
  },
  helperMuted: {
    opacity: 0.6,
  },
});
