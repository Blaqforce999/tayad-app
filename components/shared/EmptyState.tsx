import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type FeatherName = keyof typeof Feather.glyphMap;

type EmptyStateProps = {
  icon?: FeatherName;
  title: string;
  body: string;
  // Figma EmptyState states: 'default' (64px well, book-open, 18px Bold title) and
  // 'no-content' (48px well, inbox, smaller title).
  variant?: 'default' | 'no-content';
  // The Progress-empty instance drops the icon well (a ring graphic sits above).
  hideIcon?: boolean;
  style?: ViewStyle;
};

export function EmptyState({
  icon,
  title,
  body,
  variant = 'default',
  hideIcon = false,
  style,
}: EmptyStateProps) {
  const isNoContent = variant === 'no-content';
  const resolvedIcon: FeatherName = icon ?? (isNoContent ? 'inbox' : 'book-open');

  return (
    <View style={[styles.container, style]}>
      {hideIcon ? null : (
        <View style={[styles.iconWell, isNoContent ? styles.iconWellSm : styles.iconWellLg]}>
          <Feather
            name={resolvedIcon}
            size={isNoContent ? 22 : 28}
            color={tokens.colors.secondary}
          />
        </View>
      )}
      <View style={styles.copy}>
        <AppText style={isNoContent ? styles.titleSm : styles.titleLg}>{title}</AppText>
        <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.body}>
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surfaceContainer,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.md,
  },
  iconWell: {
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellLg: {
    width: 64,
    height: 64,
  },
  iconWellSm: {
    width: 48,
    height: 48,
  },
  copy: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  // Figma default title: Manrope Bold 18 (landing-body). Bold -> SemiBold.
  titleLg: {
    fontFamily: tokens.fonts.landingBody.family,
    fontSize: tokens.fonts.landingBody.size,
    letterSpacing: 0,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  // Figma no-content title: Manrope SemiBold, body-small size.
  titleSm: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.bodySmall.size,
    letterSpacing: 0,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
});
