import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Redirect, router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { queueReflection } from '@/lib/offline';
import { attachReflection } from '@/lib/plans';
import { clearReflectionContext, getReflectionContext } from '@/lib/reflection-store';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { tokens } from '@/lib/tokens';

export default function ReflectionScreen() {
  const context = getReflectionContext();
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { isOnline } = useNetworkStatus();

  if (!context) {
    return <Redirect href="/" />;
  }

  const finish = () => {
    clearReflectionContext();
    router.replace('/');
  };

  const handleSave = async () => {
    if (text.trim().length === 0) {
      finish();
      return;
    }
    setIsSaving(true);

    // Offline: hold it and attach when connectivity returns.
    if (!isOnline) {
      await queueReflection(context.planId, text.trim());
      setIsSaving(false);
      finish();
      return;
    }

    try {
      // Adds to today's already-completed log without touching pages_read.
      await attachReflection(context.planId, text.trim());
    } catch {
      // Network hiccup rather than being offline — queue it rather than lose it.
      await queueReflection(context.planId, text.trim());
      // The check-in itself already saved; a reflection failure is non-blocking.
    } finally {
      setIsSaving(false);
      finish();
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
          <AppText variant="overline" color={tokens.colors.secondary}>
            Daily reflection
          </AppText>

          <View style={styles.questionBlock}>
            <AppText style={styles.title}>One thought before you go</AppText>
            <AppText variant="bodyLarge" color={tokens.colors.secondary}>
              What did today&apos;s pages make you notice about {context.problemHint}?
            </AppText>
          </View>

          <TextArea
            label="Your thoughts"
            value={text}
            onChangeText={setText}
            placeholder="Write what came up..."
            helperText="Share what's on your mind. Be specific."
            maxLength={2000}
          />

          <Button label="Save reflection" onPress={handleSave} loading={isSaving} />
          <Button label="Skip for today" variant="ghost" onPress={finish} />
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
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.base,
  },
  questionBlock: {
    gap: tokens.spacing.sm,
  },
  // Figma: Manrope Bold 24 / 1.15 (Bold -> SemiBold).
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
});
