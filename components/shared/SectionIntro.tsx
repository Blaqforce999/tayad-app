import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type SectionIntroProps = {
  overline: string;
  title: string;
  subtitle?: string;
  // Instrument Serif ('serif') for emotional moments, Manrope Bold ('sans') otherwise.
  titleFace?: 'serif' | 'sans';
  style?: ViewStyle;
};

export function SectionIntro({
  overline,
  title,
  subtitle,
  titleFace = 'serif',
  style,
}: SectionIntroProps) {
  return (
    <View style={[styles.container, style]}>
      <AppText variant="overline" color={tokens.colors.secondary}>
        {overline}
      </AppText>
      {titleFace === 'serif' ? (
        <AppText variant="displayLarge">{title}</AppText>
      ) : (
        <AppText style={styles.sansTitle}>{title}</AppText>
      )}
      {subtitle ? (
        <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.subtitle}>
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
  subtitle: {
    marginTop: -tokens.spacing.xs,
  },
});
