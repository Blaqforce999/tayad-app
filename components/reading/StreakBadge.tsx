import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type StreakBadgeProps = {
  count: number;
  // count > 0, one day missed, token unused — the glow dims and a note shows.
  forgivenessAvailable?: boolean;
  label?: string;
  style?: ViewStyle;
};

const GLOW_SIZE = 112;
const BADGE_SIZE = 80;

export function StreakBadge({
  count,
  forgivenessAvailable = false,
  label = 'day streak',
  style,
}: StreakBadgeProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion || count === 0) {
      return;
    }
    // One slow breath every 3s on the glow layer only.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, count, pulse]);

  // Broken streak: the absence of the badge is the signal.
  if (count === 0) {
    return null;
  }

  const glowOpacity = forgivenessAvailable ? 0.1 : reduceMotion ? 0.15 : 0.2;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.glowSlot} pointerEvents="none">
        <Animated.View style={{ transform: [{ scale: pulse }], opacity: glowOpacity }}>
          <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
            <Defs>
              <RadialGradient id="streakGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={tokens.colors.primary} stopOpacity={1} />
                <Stop offset="100%" stopColor={tokens.colors.primary} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={GLOW_SIZE} height={GLOW_SIZE} fill="url(#streakGlow)" />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.badge}>
        <AppText style={styles.count}>{count}</AppText>
      </View>

      <AppText style={styles.label}>
        {forgivenessAvailable ? 'One free pass left.' : label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  glowSlot: {
    position: 'absolute',
    top: -(GLOW_SIZE - BADGE_SIZE) / 2,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma: Manrope Bold 28 (not the serif display token). Bold -> SemiBold.
  count: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayLarge.size,
    lineHeight: 36,
    color: tokens.colors.text,
    letterSpacing: 0,
  },
  // Figma caption: Manrope Regular 13, no tracking.
  label: {
    fontFamily: tokens.fonts.bodyLarge.family,
    fontSize: tokens.fonts.labelSmall.size,
    lineHeight: 18,
    color: tokens.colors.secondary,
    letterSpacing: 0,
  },
});
