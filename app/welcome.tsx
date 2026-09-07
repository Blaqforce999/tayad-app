import { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '@/lib/tokens';

// Same headline on every slide (per the Figma) — only the photo changes, so the
// text and chrome sit in a fixed overlay and just the images page behind it.
const SLIDES = [
  require('../assets/images/welcome-1.jpg'),
  require('../assets/images/welcome-2.jpg'),
] as const;

export default function WelcomeScreen() {
  const { user, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Redirect href="/" />;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) {
      setIndex(next);
    }
  };

  return (
    <View style={styles.root}>
      {/* The one dark screen in the app: light status-bar text. */}
      <StatusBar style="light" />

      <FlatList
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <Image source={item} style={{ width, height: '100%' }} resizeMode="cover" />
        )}
        style={StyleSheet.absoluteFill}
      />

      {/* Contrast scrim so white text holds over sky / sea. */}
      <View style={styles.scrim} pointerEvents="none" />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
        <View style={styles.top}>
          <View style={styles.headingGroup}>
            <AppText style={styles.title}>Find Smart Books{'\n'}Build Your Future</AppText>
            <AppText variant="bodySmall" color={tokens.colors.onSecondary} style={styles.subtitle}>
              The future is here — one app that gives you clarity on the book you need to frame
              your future.
            </AppText>
          </View>

          <View style={styles.pager}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.pagerBar, i === index ? styles.pagerBarActive : styles.pagerBarIdle]}
              />
            ))}
          </View>
        </View>

        <View style={styles.cta}>
          <Button label="Create account" onPress={() => router.push('/sign-up')} />
          <Button label="Login" variant="ghost" onPress={() => router.push('/sign-in')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Shows through only while the first photo decodes.
    backgroundColor: tokens.colors.text,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.text,
    opacity: 0.35,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.base,
  },
  top: {
    paddingTop: tokens.spacing.xxl,
    gap: tokens.spacing.xl,
  },
  headingGroup: {
    gap: tokens.spacing.xs,
  },
  // Figma hero is 40px Instrument Serif — between displayLarge (28) and
  // heroMobile (48), so composed from token parts.
  title: {
    fontFamily: tokens.fonts.heroMobile.family,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.6,
    color: tokens.colors.onSecondary,
  },
  subtitle: {
    maxWidth: 320,
  },
  pager: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  pagerBar: {
    flex: 1,
    height: tokens.spacing.sm,
    borderRadius: tokens.spacing.sm,
  },
  pagerBarActive: {
    backgroundColor: tokens.colors.primary,
  },
  pagerBarIdle: {
    // Figma used the warm-neutral/400 primitive; white at low opacity is the
    // token-based equivalent on this dark ground.
    backgroundColor: tokens.colors.onSecondary,
    opacity: 0.4,
  },
  cta: {
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
});
