import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { tokens } from '@/lib/tokens';

type Variant = keyof typeof tokens.fonts;

type AppTextProps = TextProps & {
  variant?: Variant;
  // Overrides the default deep-ink colour. Pass a token, e.g. tokens.colors.textMuted.
  color?: string;
};

export function AppText({ variant = 'bodyLarge', color, style, ...rest }: AppTextProps) {
  return <Text style={[styles[variant], color ? { color } : null, style]} {...rest} />;
}

// One StyleSheet entry per typographic role in lib/tokens.ts, so screens never
// re-declare font family / size / tracking.
const styles = StyleSheet.create(
  Object.fromEntries(
    Object.entries(tokens.fonts).map(([key, font]) => [
      key,
      {
        fontFamily: font.family,
        fontSize: font.size,
        // React Native treats lineHeight as a hard line box, unlike CSS. At a
        // 1.0 multiplier the box equals the font size and descenders (g, y, p)
        // are clipped — the design system's tight button leading means "one
        // centred line", so hand those back to the platform's natural leading.
        lineHeight: font.lineHeight > 1 ? font.size * font.lineHeight : undefined,
        letterSpacing: font.letterSpacing,
        color: tokens.colors.text,
      } satisfies TextStyle,
    ]),
  ) as Record<Variant, TextStyle>,
);
