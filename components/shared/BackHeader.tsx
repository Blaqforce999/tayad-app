import { Pressable, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import BackCta from '@/assets/icons/back-cta.svg';
import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type BackHeaderProps = {
  title: string;
  onBack?: () => void;
};

// Figma Settings back-header: circular "Back cta" + screen title (Manrope
// SemiBold 16), gap 12, pt 8 / pb 12.
export function BackHeader({ title, onBack }: BackHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
      >
        <BackCta width={40} height={41} />
      </Pressable>
      <AppText style={styles.title}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.md,
  },
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.bodyLarge.size,
    lineHeight: tokens.fonts.bodyLarge.size * 1.35,
    letterSpacing: tokens.fonts.labelButton.letterSpacing,
    color: tokens.colors.text,
  },
});
