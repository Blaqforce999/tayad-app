import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/shared/Screen';
import { BackHeader } from '@/components/shared/BackHeader';
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
      <BackHeader title="Account" />

      <View style={styles.content}>
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarInitial}>{initial}</AppText>
          </View>
          <View style={styles.userInfo}>
            <AppText style={styles.email}>{email || '—'}</AppText>
            <AppText style={styles.since}>{since}</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>Sign in method</AppText>
          <View style={styles.row}>
            <AppText variant="labelButton">Email</AppText>
            <AppText style={styles.rowValue}>Email and password</AppText>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />

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
  content: {
    gap: tokens.spacing.lg,
    paddingTop: tokens.spacing.sm,
  },
  identityCard: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: tokens.radii.card,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.xl,
    alignItems: 'center',
    gap: tokens.spacing.md,
    ...tokens.shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma: Instrument Serif 32, white.
  avatarInitial: {
    fontFamily: tokens.fonts.displayMedium.family,
    fontSize: 32,
    color: tokens.colors.surfaceRaised,
  },
  userInfo: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  // Figma: Manrope Bold 17 (Bold -> SemiBold).
  email: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 17,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  // Figma: Manrope Medium 12, dust, uppercase, +3% tracking.
  since: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: 12,
    letterSpacing: 0.36,
    textTransform: 'uppercase',
    color: tokens.colors.textMuted,
  },
  section: {
    gap: tokens.spacing.sm,
  },
  // Figma: Manrope SemiBold 11, dust, uppercase, +8% tracking.
  sectionLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.overline.size,
    letterSpacing: tokens.fonts.overline.letterSpacing,
    textTransform: 'uppercase',
    color: tokens.colors.textMuted,
  },
  // Figma ListRow: column, radius 16, p16, min-h 52.
  row: {
    minHeight: 52,
    borderRadius: tokens.radii.input,
    backgroundColor: tokens.colors.surfaceContainer,
    padding: tokens.spacing.base,
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
  },
  rowValue: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingBottom: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
});
