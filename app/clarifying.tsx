import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { detectCrisis } from '@/lib/crisis';
import { stubMatch } from '@/lib/match-stub';
import { saveRecommendation } from '@/lib/plans';
import { setRecommendationSession } from '@/lib/session-store';
import { tokens } from '@/lib/tokens';

// Reached when the matcher needs more context. The original problem text comes
// in as a param; this adds to it and re-runs the match.
export default function ClarifyingScreen() {
  const { problem } = useLocalSearchParams<{ problem?: string }>();
  const [extra, setExtra] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!problem) {
    return <Redirect href="/problem" />;
  }

  const handleSubmit = async () => {
    const combined = `${problem}\n\n${extra.trim()}`.trim();
    if (detectCrisis(combined).isCrisis) {
      router.replace('/crisis');
      return;
    }

    setIsSubmitting(true);
    try {
      const picks = await stubMatch(combined);
      let recommendationId: string | null = null;
      try {
        recommendationId = await saveRecommendation(combined, picks);
      } catch {
        // best effort
      }
      setRecommendationSession({ problemText: combined, recommendationId, picks });
      router.replace('/recommendation');
    } catch {
      setIsSubmitting(false);
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
          <View style={styles.textBlock}>
            <AppText variant="displayMedium">Help me understand</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              A little more context helps me find the right book for you.
            </AppText>
          </View>

          <TextArea
            label="Your thoughts"
            value={extra}
            onChangeText={setExtra}
            placeholder="A little more context..."
            maxLength={2000}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Find my book"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={extra.trim().length === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.lg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: tokens.spacing.base,
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.base,
  },
  textBlock: {
    gap: tokens.spacing.xs,
  },
  footer: {
    paddingTop: tokens.spacing.base,
    paddingBottom: tokens.spacing.lg,
  },
});
