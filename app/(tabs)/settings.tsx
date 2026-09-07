import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { tokens } from '@/lib/tokens';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // On success AuthContext clears the user and the tab layout redirects to sign-in.
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.body}>
        <AppText variant="displayMedium">Settings</AppText>

        <View style={styles.card}>
          <AppText variant="labelSmall" color={tokens.colors.textMuted}>
            Signed in as
          </AppText>
          <AppText variant="bodyLarge">{user?.email ?? '—'}</AppText>
        </View>

        <Button
          label="Sign out"
          variant="secondary"
          onPress={handleSignOut}
          loading={isSigningOut}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: tokens.spacing.xxl,
    gap: tokens.spacing.lg,
  },
  card: {
    backgroundColor: tokens.colors.surfaceContainer,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.cardPadding,
    gap: tokens.spacing.xs,
    ...tokens.shadows.card,
  },
});
