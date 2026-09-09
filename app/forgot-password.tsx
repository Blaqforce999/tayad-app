import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Redirect, router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wordmark } from '@/components/ui/Wordmark';
import { useAuth } from '@/hooks/useAuth';
import { sendPasswordReset } from '@/lib/auth';
import { tokens } from '@/lib/tokens';

export default function ForgotPasswordScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (user) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim(), Linking.createURL('/reset-password'));
    } catch {
      // Deliberately silent: never reveal whether an address has an account.
    } finally {
      setIsSubmitting(false);
      setSent(true);
    }
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.backNav}
            onPress={() => router.replace('/sign-in')}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={20} color={tokens.colors.secondary} />
            <AppText style={styles.backText}>Back to sign in</AppText>
          </Pressable>

          <Wordmark size="sm" />

          <View style={styles.headingGroup}>
            <AppText variant="displayLarge">
              {sent ? 'Check your email' : 'Reset your password'}
            </AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              {sent
                ? `If an account exists for ${email.trim()}, a reset link is on its way.`
                : "Enter your email and we'll send a reset link to you."}
            </AppText>
          </View>

          {sent ? (
            <Button label="Back to sign in" onPress={() => router.replace('/sign-in')} />
          ) : (
            <>
              <Input
                label="Email address"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />

              <Button
                label="Send reset link"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={email.trim().length === 0}
              />

              <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.switchRow}>
                Remembered it?{' '}
                <AppText
                  variant="bodySmall"
                  style={styles.link}
                  onPress={() => router.replace('/sign-in')}
                >
                  Sign in
                </AppText>
              </AppText>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.lg,
  },
  backNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.bodySmall.size,
    letterSpacing: 0,
    color: tokens.colors.secondary,
  },
  headingGroup: {
    gap: tokens.spacing.sm,
  },
  switchRow: {
    textAlign: 'center',
  },
  link: {
    fontFamily: tokens.fonts.labelButton.family,
    color: tokens.colors.text,
  },
});
