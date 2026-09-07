import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { tokens } from '@/lib/tokens';

export default function ProgressScreen() {
  return (
    <Screen edges={['top']}>
      <View style={styles.body}>
        <AppText variant="displayMedium">Progress</AppText>
        <AppText variant="bodyLarge" color={tokens.colors.textMuted} style={styles.subtitle}>
          Your streak, reading history, and reflections will live here once you
          start a plan.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: tokens.spacing.xxl,
  },
  subtitle: {
    marginTop: tokens.spacing.md,
  },
});
