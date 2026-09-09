import { StyleSheet, View } from 'react-native';

import { Redirect, router } from 'expo-router';

import LogoMark from '@/assets/logo/mark.svg';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '@/lib/tokens';

export default function OnboardingScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Only reachable with an account (sign-up routes here on success).
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <LogoMark width={56} height={56} />
        </View>

        <View style={styles.headingGroup}>
          <AppText variant="displayLarge" style={styles.center}>
            One book, just for you
          </AppText>
          <AppText variant="bodyLarge" color={tokens.colors.secondary} style={styles.center}>
            Tell us what&apos;s on your mind. We&apos;ll find the read that meets you there.
          </AppText>
        </View>
      </View>

      <View style={styles.bottomCta}>
        <Button label="Let's go" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.base,
    paddingVertical: tokens.spacing.lg,
  },
  mark: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingGroup: {
    alignItems: 'center',
    gap: tokens.spacing.md,
    maxWidth: 327,
  },
  center: {
    textAlign: 'center',
  },
  bottomCta: {
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
});
