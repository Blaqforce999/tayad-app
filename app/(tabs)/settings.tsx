import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import { SettingsGroup, SettingsRow } from '@/components/settings/SettingsRow';
import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { fetchProfile, formatReminderTime } from '@/lib/settings';
import { tokens } from '@/lib/tokens';

import { usePlan } from '@/hooks/usePlan';

export default function SettingsScreen() {
  const { plan } = usePlan();
  const [email, setEmail] = useState('');
  const [reminder, setReminder] = useState('20:00');

  useFocusEffect(
    useCallback(() => {
      fetchProfile()
        .then((profile) => {
          setEmail(profile.email);
          setReminder(profile.notificationTime);
        })
        .catch(() => undefined);
    }, []),
  );

  const { time, period } = formatReminderTime(reminder);

  return (
    <Screen edges={['top']} style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText style={styles.title}>Settings</AppText>

        <View style={styles.groups}>
          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>READING</AppText>
            <SettingsGroup>
              <SettingsRow
                icon="book"
                title="Daily page goal"
                subtitle={plan ? `${plan.dailyPages} pages a day` : 'Set when you start a plan'}
                onPress={() =>
                  plan
                    ? router.push('/daily-goal')
                    : Alert.alert(
                        'No active plan',
                        'Start a reading plan and your daily goal will live here.',
                      )
                }
              />
              <SettingsRow
                icon="bell"
                title="Reading reminder"
                subtitle={`Every day at ${time} ${period}`}
                onPress={() => router.push('/settings-reminder')}
              />
            </SettingsGroup>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>PRIVACY</AppText>
            <SettingsGroup>
              <SettingsRow
                icon="shield"
                title="Your data"
                subtitle="What we keep and never keep"
                onPress={() => router.push('/settings-privacy')}
              />
            </SettingsGroup>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>ACCOUNT</AppText>
            <SettingsGroup>
              <SettingsRow
                icon="user"
                title="Account"
                subtitle={email || '—'}
                onPress={() => router.push('/settings-account')}
              />
            </SettingsGroup>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  content: {
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.base,
    gap: tokens.spacing.base,
  },
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: tokens.fonts.displayMedium.size,
    lineHeight: tokens.fonts.displayMedium.size * 1.15,
    letterSpacing: 0,
    color: tokens.colors.text,
  },
  // Figma inner content frame: extra 24 top padding, 16 gap between sections.
  groups: {
    paddingTop: tokens.spacing.lg,
    gap: tokens.spacing.base,
  },
  section: {
    gap: tokens.spacing.sm,
  },
  // Figma: 10px Manrope SemiBold, dust, +1px tracking, 1.4 leading.
  sectionLabel: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    color: tokens.colors.textMuted,
  },
});
