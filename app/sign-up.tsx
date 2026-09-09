import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { OAuthCancelledError, signInWithGoogle, signUpWithEmail } from '@/lib/auth';
import { tokens } from '@/lib/tokens';

// Supabase is configured to reject passwords shorter than this.
const MIN_PASSWORD_LENGTH = 8;

export default function SignUpScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  if (user) {
    return <Redirect href="/" />;
  }

  const canSubmit = email.length > 0 && password.length >= MIN_PASSWORD_LENGTH;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUpWithEmail(email.trim(), password);
      if (needsEmailConfirmation) {
        setAwaitingConfirmation(true);
      } else {
        router.replace('/onboarding');
      }
    } catch {
      setError('Could not create your account. Check your details and try again.');
    } finally {
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
        setError('Could not sign up with Google. Try again.');
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  // Apple sign-in needs a paid Apple Developer account — not available yet.
  const handleApple = () => {
    Alert.alert('Coming soon', 'Sign in with Apple is on the way.');
  };

  if (awaitingConfirmation) {
    return (
      <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
        <View style={styles.confirm}>
          <Wordmark size="sm" />
          <View style={styles.headingGroup}>
            <AppText variant="displayLarge">Check your email</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.subtitle}>
              We sent a confirmation link to {email.trim()}. Tap it, then come back and sign in.
            </AppText>
          </View>
          <Button label="Back to sign in" variant="secondary" onPress={() => router.replace('/sign-in')} />
        </View>
      </Screen>
    );
  }

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
            <AppText variant="displayLarge">Create your account</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              One book, matched to you. Find it free.
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
              placeholder="Create a password"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              error={
                password.length > 0 && password.length < MIN_PASSWORD_LENGTH
                  ? `At least ${MIN_PASSWORD_LENGTH} characters.`
                  : undefined
              }
            />
            {error ? (
              <AppText variant="bodySmall" color={tokens.colors.error}>
                {error}
              </AppText>
            ) : null}
          </View>

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
            label="Create account"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
          />

          <AppText style={styles.legal}>
            By continuing, you agree to our{' '}
            <AppText style={styles.legalStrong}>Terms</AppText> &{' '}
            <AppText style={styles.legalStrong}>Privacy Policy</AppText>
          </AppText>

          <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.switchRow}>
            Already have an account?{' '}
            <AppText
              variant="bodySmall"
              style={styles.link}
              onPress={() => router.replace('/sign-in')}
            >
              Sign in
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
  confirm: {
    flex: 1,
    justifyContent: 'center',
    gap: tokens.spacing.lg,
  },
  headingGroup: {
    gap: tokens.spacing.xs,
  },
  subtitle: {
    marginTop: tokens.spacing.xs,
  },
  form: {
    gap: tokens.spacing.sm,
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
  // Figma: label-small size (13) but Manrope Regular weight — our type scale
  // pairs 13 only with Medium, so this one style is composed from token parts.
  legal: {
    fontFamily: tokens.fonts.bodySmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    lineHeight: tokens.fonts.labelSmall.size * 1.5,
    letterSpacing: 0,
    color: tokens.colors.secondary,
    textAlign: 'center',
  },
  legalStrong: {
    fontFamily: tokens.fonts.labelButton.family,
    color: tokens.colors.text,
  },
  switchRow: {
    textAlign: 'center',
  },
  link: {
    fontFamily: tokens.fonts.labelButton.family,
    color: tokens.colors.text,
  },
});
