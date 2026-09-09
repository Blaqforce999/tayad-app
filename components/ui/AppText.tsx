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
        // Always give Text an explicit line box: a missing lineHeight makes some
        // Android skins (MIUI) render custom fonts with a stroked outline. A 1.0
        // token multiplier ("one tight centred line") is bumped to 1.3 so the
        // box is still snug but descenders (g, y, p) are not clipped.
        lineHeight: font.size * (font.lineHeight > 1 ? font.lineHeight : 1.3),
        letterSpacing: font.letterSpacing,
        // The overline role is always set in caps in the Figma design system.
        textTransform: key === 'overline' ? 'uppercase' : undefined,
        color: tokens.colors.text,
      } satisfies TextStyle,
    ]),
  ) as Record<Variant, TextStyle>,
);
