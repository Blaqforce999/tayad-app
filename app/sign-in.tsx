import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Redirect, router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SocialButton } from '@/components/ui/SocialButton';
import { Wordmark } from '@/components/ui/Wordmark';
import { useAuth } from '@/hooks/useAuth';
import { signInWithEmail } from '@/lib/auth';
import { tokens } from '@/lib/tokens';

export default function SignInScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/');
    } catch {
      setError('That email or password looks off. Try again.');
      setIsSubmitting(false);
    }
  };

  // Social sign-in UI is in place; the OAuth flow is wired in a later pass.
  const handleSocial = () => {
    Alert.alert('Coming soon', 'Sign in with Apple and Google is on the way.');
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
          <Wordmark size="sm" />

          <View style={styles.headingGroup}>
            <AppText variant="displayLarge">Welcome back</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              Sign in to your reading journey.
            </AppText>
          </View>

          <View style={styles.form}>
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
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            {error ? (
              <AppText variant="bodySmall" color={tokens.colors.error}>
                {error}
              </AppText>
            ) : null}
          </View>

          <Pressable
            style={styles.forgotRow}
            onPress={() => router.push('/forgot-password')}
            accessibilityRole="button"
          >
            <AppText style={styles.forgotText}>Forgot password?</AppText>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              or
            </AppText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialStack}>
            <SocialButton provider="apple" onPress={handleSocial} />
            <SocialButton provider="google" onPress={handleSocial} />
          </View>

          <Button
            label="Sign in"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!email || !password}
          />

          <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.switchRow}>
            Don&apos;t have an account?{' '}
            <AppText
              variant="bodySmall"
              style={styles.link}
              onPress={() => router.replace('/sign-up')}
            >
              Create one
            </AppText>
          </AppText>
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
  headingGroup: {
    gap: tokens.spacing.xs,
  },
  form: {
    gap: tokens.spacing.sm,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    // Pull up against the 24px stack gap so it reads as attached to the form.
    marginTop: -tokens.spacing.md,
  },
  forgotText: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.bodySmall.size,
    letterSpacing: tokens.fonts.bodySmall.letterSpacing,
    color: tokens.colors.secondary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
  socialStack: {
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
