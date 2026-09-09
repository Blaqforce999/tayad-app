import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wordmark } from '@/components/ui/Wordmark';
import { completePasswordReset } from '@/lib/auth';
import { tokens } from '@/lib/tokens';

const MIN_PASSWORD_LENGTH = 8;

// Reached by deep link from the reset email: tayad://reset-password?code=...
export default function ResetPasswordScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!code) {
    return (
      <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <View style={styles.expired}>
          <Wordmark size="sm" />
          <View style={styles.headingGroup}>
            <AppText variant="displayLarge">This link has expired</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              Reset links only work once and time out quickly. Ask for a fresh one.
            </AppText>
          </View>
          <Button label="Back to sign in" onPress={() => router.replace('/sign-in')} />
        </View>
      </Screen>
    );
  }

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= MIN_PASSWORD_LENGTH && confirm === password;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await completePasswordReset(code, password);
      router.replace('/');
    } catch {
      setIsSubmitting(false);
      setError('That link is no longer valid. Ask for a new reset email.');
    }
  };

  return (
    <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Wordmark size="sm" />

          <View style={styles.headingGroup}>
            <AppText variant="displayLarge">Set a new password</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              Pick something you'll remember. You'll be signed in straight after.
            </AppText>
          </View>

          <View style={styles.form}>
            <Input
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              error={tooShort ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
            />
            <Input
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Type it again"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              error={mismatch ? 'These do not match.' : undefined}
            />
            {error ? (
              <AppText variant="bodySmall" color={tokens.colors.error}>
                {error}
              </AppText>
            ) : null}
          </View>

          <Button
            label="Save new password"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: tokens.spacing.base },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.lg,
  },
  expired: { flex: 1, justifyContent: 'center', gap: tokens.spacing.lg },
  headingGroup: { gap: tokens.spacing.sm },
  form: { gap: tokens.spacing.base },
});
