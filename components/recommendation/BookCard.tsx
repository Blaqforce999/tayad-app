import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { tokens } from '@/lib/tokens';
import type { CatalogueBook } from '@/lib/catalogue';

import { AppText } from '@/components/ui/AppText';

type BookCardProps = {
  book: CatalogueBook;
  explanation: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
  style?: ViewStyle;
};

// Figma BookCard (component 218:150806). The whole card is the tap target — the
// screen instances carry no inner CTA button, so neither does this. Meta text is
// Manrope Regular 13 (label-small size), title is Instrument Serif 24.
export function BookCard({ book, explanation, variant, onPress, style }: BookCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue: number) =>
    Animated.timing(scale, { toValue, duration: 120, useNativeDriver: true }).start();

  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}`}
    >
      <Animated.View
        style={[
          styles.card,
          isPrimary ? styles.primaryCard : styles.secondaryCard,
          { transform: [{ scale }] },
          style,
        ]}
      >
        {isPrimary ? (
          <>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.hero} resizeMode="cover" />
            ) : (
              <View style={[styles.hero, styles.heroFallback]}>
                <Ionicons name="book-outline" size={28} color={tokens.colors.textMuted} />
              </View>
            )}
            <View style={styles.primaryBody}>
              <View style={styles.badge}>
                <AppText variant="overline" color={tokens.colors.onPrimary}>
                  Our pick
                </AppText>
              </View>
              <View style={styles.meta}>
                <AppText variant="displayMedium">{book.title}</AppText>
                <AppText style={styles.metaText}>{book.author}</AppText>
              </View>
              <AppText style={styles.blurb}>{explanation}</AppText>
            </View>
          </>
        ) : (
          <View style={styles.row}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={[styles.thumb, styles.heroFallback]}>
                <Ionicons name="book-outline" size={20} color={tokens.colors.textMuted} />
              </View>
            )}
            <View style={styles.rowBody}>
              <AppText variant="displayMedium">{book.title}</AppText>
              <AppText style={styles.metaText}>{book.author}</AppText>
              <AppText style={styles.blurb}>{explanation}</AppText>
            </View>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radii.card,
    overflow: 'hidden',
    padding: tokens.spacing.base,
    ...tokens.shadows.card,
  },
  primaryCard: {
    backgroundColor: tokens.colors.surfaceRaised,
  },
  secondaryCard: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
  hero: {
    width: '100%',
    height: 160,
  },
  heroFallback: {
    backgroundColor: tokens.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma book-body: extra px16 / pt12 / pb16 inside the card's own 16 padding.
  primaryBody: {
    paddingHorizontal: tokens.spacing.base,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radii.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  meta: {
    gap: tokens.spacing.xs,
  },
  // Figma pairs 13px with Manrope Regular; labelSmall token is 13 Medium +2%,
  // so author / blurb use body-small's regular family at label-small's size.
  metaText: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
  blurb: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    lineHeight: tokens.fonts.labelSmall.size * 1.4,
    color: tokens.colors.secondary,
  },
  // Figma book-row: its own 16 padding on top of the card's 16.
  row: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    padding: tokens.spacing.base,
  },
  thumb: {
    width: 72,
    height: 104,
    borderRadius: tokens.radii.input,
  },
  rowBody: {
    flex: 1,
    gap: tokens.spacing.sm,
  },
});
