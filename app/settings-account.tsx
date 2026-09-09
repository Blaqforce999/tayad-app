import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/shared/Screen';
import { BackHeader } from '@/components/shared/BackHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { changeEmail, changePassword, signOut } from '@/lib/auth';
import { fetchProfile, formatMemberSince } from '@/lib/settings';
import { tokens } from '@/lib/tokens';

const MIN_PASSWORD_LENGTH = 8;

export default function SettingsAccountScreen() {
  const [email, setEmail] = useState('');
  const [since, setSince] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailNote, setEmailNote] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwNote, setPwNote] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

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

  const handleChangeEmail = async () => {
    setEmailError(null);
    setEmailNote(null);
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailBusy(true);
    try {
      await changeEmail(newEmail);
      setNewEmail('');
      setEmailNote('Check your inbox — confirm the link to finish the change.');
    } catch {
      setEmailError('Could not update your email. Try again in a moment.');
    } finally {
      setEmailBusy(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError(null);
    setPwNote(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPwError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setPwError('Those do not match.');
      return;
    }
    setPwBusy(true);
    try {
      await changePassword(password);
      setPassword('');
      setConfirm('');
      setPwNote('Password updated.');
    } catch {
      setPwError('Could not update your password. Try again in a moment.');
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <BackHeader title="Account" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>Change email</AppText>
          <Input
            label="New email address"
            value={newEmail}
            onChangeText={(t) => {
              setNewEmail(t);
              if (emailError) setEmailError(null);
            }}
            placeholder="your@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            error={emailError ?? undefined}
            helperText={emailNote ?? undefined}
          />
          <Button
            label="Update email"
            variant="secondary"
            onPress={handleChangeEmail}
            loading={emailBusy}
            disabled={newEmail.trim().length === 0}
          />
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>Change password</AppText>
          <Input
            label="New password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (pwError) setPwError(null);
            }}
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Input
            label="Confirm new password"
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              if (pwError) setPwError(null);
            }}
            placeholder="Type it again"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={pwError ?? undefined}
            helperText={pwNote ?? undefined}
          />
          <Button
            label="Update password"
            variant="secondary"
            onPress={handleChangePassword}
            loading={pwBusy}
            disabled={password.length === 0 || confirm.length === 0}
          />
        </View>

        <Button label="Sign out" variant="ghost" onPress={handleSignOut} loading={isSigningOut} />
      </ScrollView>
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
    paddingBottom: tokens.spacing.xl,
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
    lineHeight: 40,
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
    lineHeight: 22,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  // Figma: Manrope Medium 12, dust, uppercase, +3% tracking.
  since: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: 12,
    lineHeight: 18,
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
    lineHeight: 16,
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
    lineHeight: 18,
    color: tokens.colors.secondary,
  },
});
