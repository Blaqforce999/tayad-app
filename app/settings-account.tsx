import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/lib/auth';
import { fetchProfile, formatMemberSince } from '@/lib/settings';
import { tokens } from '@/lib/tokens';

export default function SettingsAccountScreen() {
  const [email, setEmail] = useState('');
  const [since, setSince] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        setEmail(profile.email);
        setSince(formatMemberSince(profile.createdAt));
      })
      .catch(() => undefined);
  }, []);

  const initial = (email.trim()[0] ?? '?').toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={tokens.colors.text} />
        </Pressable>
        <AppText variant="labelButton">Account</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="raised" style={styles.identity}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarInitial}>{initial}</AppText>
          </View>
          <View style={styles.identityText}>
            <AppText style={styles.email}>{email || '—'}</AppText>
            <AppText variant="metadata" color={tokens.colors.textMuted} style={styles.since}>
              {since}
            </AppText>
          </View>
        </Card>

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>SIGN IN METHOD</AppText>
          <View style={styles.row}>
            <AppText variant="labelButton">Email</AppText>
            <AppText variant="labelSmall" color={tokens.colors.secondary}>
              Email and password
            </AppText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Sign out" variant="ghost" onPress={handleSignOut} loading={isSigningOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    paddingTop: tokens.spacing.xs,
    paddingBottom: tokens.spacing.md,
  },
  content: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.lg,
  },
  identity: {
    alignItems: 'center',
    gap: tokens.spacing.md,
    paddingVertical: tokens.spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: tokens.fonts.displayMedium.family,
    fontSize: 32,
    color: tokens.colors.onSecondary,
  },
  identityText: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  email: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 17,
    color: tokens.colors.text,
  },
  since: {
    textTransform: 'uppercase',
  },
  section: {
    gap: tokens.spacing.sm,
  },
  sectionLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 11,
    letterSpacing: 1,
    color: tokens.colors.textMuted,
  },
  row: {
    minHeight: 52,
    borderRadius: tokens.radii.input,
    backgroundColor: tokens.colors.surfaceContainer,
    paddingHorizontal: tokens.spacing.base,
    paddingVertical: tokens.spacing.md,
    justifyContent: 'center',
    gap: 2,
  },
  footer: {
    paddingVertical: tokens.spacing.sm,
  },
});
