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

// Meta text: Figma pairs 13px with Manrope Regular; our labelSmall token is
// 13 Medium +2%, so author / blurb use body-small size with the regular family.
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
              <View style={styles.ctaPill}>
                <AppText variant="labelButton">View book</AppText>
              </View>
            </View>
          </>
        ) : (
          <>
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
            <View style={styles.secondaryCta}>
              <AppText variant="labelSmall" color={tokens.colors.primaryPressed}>
                View book
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={tokens.colors.primaryPressed} />
            </View>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radii.card,
    overflow: 'hidden',
    ...tokens.shadows.card,
  },
  primaryCard: {
    backgroundColor: tokens.colors.surfaceRaised,
  },
  secondaryCard: {
    backgroundColor: tokens.colors.surfaceContainerHigh,
    padding: tokens.spacing.base,
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
  primaryBody: {
    padding: tokens.spacing.base,
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
  ctaPill: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radii.pill,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
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
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.md,
  },
});
