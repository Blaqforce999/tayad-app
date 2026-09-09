import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Redirect, router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { BackHeader } from '@/components/shared/BackHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { setPagesRead } from '@/lib/plans';
import { tokens } from '@/lib/tokens';

import { usePlan } from '@/hooks/usePlan';

export default function UpdatePagesScreen() {
  const { plan, refresh } = usePlan();
  const [value, setValue] = useState(() => String(plan?.pagesRead ?? 0));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) {
    return <Redirect href="/" />;
  }

  const parsed = Number(value);
  const isValid =
    value.trim().length > 0 &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed <= plan.totalPages;

  const handleSave = async () => {
    if (!isValid) {
      setError(`Enter a page between 0 and ${plan.totalPages}.`);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await setPagesRead(plan.id, parsed);
      await refresh();
      router.back();
    } catch {
      setIsSaving(false);
      setError('Could not save that. Try again in a moment.');
    }
  };

  return (
    <Screen style={styles.screen}>
      <BackHeader title="Update page number" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.body}>
          <View style={styles.lead}>
            <AppText variant="displayMedium">Where are you really?</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              Set the page you actually reached. Your plan and progress follow this number.
            </AppText>
          </View>

          <Input
            label="Page number"
            value={value}
            onChangeText={(next) => {
              setValue(next.replace(/[^0-9]/g, ''));
              if (error) {
                setError(null);
              }
            }}
            keyboardType="number-pad"
            placeholder="0"
            helperText={`${plan.book.title} is ${plan.totalPages} pages.`}
            error={error ?? undefined}
          />
        </View>

        <View style={styles.footer}>
          <Button label="Save" onPress={handleSave} loading={isSaving} disabled={!isValid} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: tokens.spacing.base },
  flex: { flex: 1 },
  body: { flex: 1, gap: tokens.spacing.lg },
  lead: { gap: tokens.spacing.sm },
  footer: { paddingVertical: tokens.spacing.sm },
});
