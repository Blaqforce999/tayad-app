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
import { OAuthCancelledError, signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { tokens } from '@/lib/tokens';

export default function SignInScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

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

  const handleGoogle = async () => {
    setError(null);
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
      // AuthContext picks up the session; the `user` redirect above takes over.
    } catch (err) {
      if (!(err instanceof OAuthCancelledError)) {
        setError('Could not sign in with Google. Try again.');
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  // Apple sign-in needs a paid Apple Developer account — not available yet.
  const handleApple = () => {
    Alert.alert('Coming soon', 'Sign in with Apple is on the way.');
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
            <SocialButton provider="apple" onPress={handleApple} />
            <SocialButton provider="google" onPress={handleGoogle} disabled={googleBusy} />
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
  },
  // Figma: Manrope SemiBold 14, secondary, no tracking.
  forgotText: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.bodySmall.size,
    letterSpacing: 0,
    color: tokens.colors.secondary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
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
