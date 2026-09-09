import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type SectionIntroProps = {
  overline: string;
  title: string;
  subtitle?: string;
  // Instrument Serif ('serif') for emotional moments, Manrope Bold ('sans') otherwise.
  titleFace?: 'serif' | 'sans';
  // Serif title size: 'large' = display-large (28), 'medium' = display-medium (24).
  size?: 'large' | 'medium';
  style?: ViewStyle;
};

export function SectionIntro({
  overline,
  title,
  subtitle,
  titleFace = 'serif',
  size = 'large',
  style,
}: SectionIntroProps) {
  return (
    <View style={[styles.container, style]}>
      <AppText variant="overline" color={tokens.colors.secondary}>
        {overline}
      </AppText>
      {titleFace === 'serif' ? (
        <AppText variant={size === 'medium' ? 'displayMedium' : 'displayLarge'}>
          {title}
        </AppText>
      ) : (
        <AppText style={styles.sansTitle}>{title}</AppText>
      )}
      {subtitle ? (
        <AppText variant="bodySmall" color={tokens.colors.secondary}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: tokens.spacing.sm,
  },
  // Figma uses Manrope Bold at display-medium size for non-emotional titles.
  sansTitle: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
});
