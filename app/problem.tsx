import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Skeleton } from '@/components/shared/Skeleton';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { detectCrisis } from '@/lib/crisis';
import { stubMatch } from '@/lib/match-stub';
import { saveRecommendation } from '@/lib/plans';
import { setRecommendationSession } from '@/lib/session-store';
import { tokens } from '@/lib/tokens';
import { problemInputSchema } from '@/lib/validators';

export default function ProblemScreen() {
  const { isOnline } = useNetworkStatus();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = async () => {
    const parsed = problemInputSchema.safeParse(text);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Tell us a little more.');
      return;
    }
    setError(null);
    const problem = parsed.data;

    if (!isOnline) {
      router.push('/status?kind=offline-input');
      return;
    }

    // Crisis screening happens on-device, before anything is sent or stored.
    if (detectCrisis(problem).isCrisis) {
      setText('');
      router.push('/crisis');
      return;
    }

    setIsThinking(true);
    try {
      const picks = await stubMatch(problem);
      let recommendationId: string | null = null;
      try {
        recommendationId = await saveRecommendation(problem, picks);
      } catch {
        // Persisting the session is best-effort; the flow continues regardless.
      }
      setRecommendationSession({ problemText: problem, recommendationId, picks });
      router.replace('/recommendation');
    } catch {
      setIsThinking(false);
      setError('Could not reach the catalogue. Try again in a moment.');
    }
  };

  if (isThinking) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.content}>
          <SectionIntro
            overline="Finding your match"
            title="Working on it."
            subtitle="Reading what you shared and finding three books that fit."
          />
          <View style={styles.divider} />
          <View style={styles.spinner}>
            <ActivityIndicator color={tokens.colors.primary} size="large" />
          </View>
          <View style={styles.divider} />
          <View style={styles.skeletonList}>
            {[0.5, 0.4, 0.3].map((opacity) => (
              <View key={opacity} style={[styles.skeletonRow, { opacity }]}>
                <Skeleton height={64} width={48} radius={tokens.radii.input} />
                <View style={styles.skeletonText}>
                  <Skeleton height={12} width={160} radius={tokens.radii.pill} />
                  <Skeleton height={10} width={100} radius={tokens.radii.pill} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

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
          <SectionIntro
            overline="Tayad AI"
            title="What are you tired of?"
            subtitle="This stays private. Say it plainly, in your own words."
          />
          <View style={styles.divider} />

          <TextArea
            label="Your thoughts"
            value={text}
            onChangeText={(next) => {
              setText(next);
              if (error) {
                setError(null);
              }
            }}
            placeholder="I'm tired of..."
            helperText="Share what's on your mind. Be specific."
            error={error ?? undefined}
            maxLength={2000}
          />

          {!isOnline ? (
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              You need internet to find your book.
            </AppText>
          ) : null}

          <Button
            label="Find my book"
            onPress={handleSubmit}
            disabled={text.trim().length === 0}
          />
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
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
  spinner: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
  },
  skeletonList: {
    gap: tokens.spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.md,
  },
  skeletonText: {
    flex: 1,
    gap: tokens.spacing.sm,
  },
});
