import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { StatusSheet } from '@/components/shared/StatusSheet';
import { tokens } from '@/lib/tokens';

type Kind =
  | 'offline-input'
  | 'offline-checkin'
  | 'error'
  | 'no-results'
  | 'notifications';

const dismiss = () => router.back();

const CONTENT: Record<
  Kind,
  {
    icon: Parameters<typeof StatusSheet>[0]['icon'];
    title: string;
    body: string;
    primary?: { label: string; onPress: () => void };
    secondary?: { label: string; onPress: () => void };
  }
> = {
  'offline-input': {
    icon: 'cloud-offline-outline',
    title: "You're offline",
    body: 'Connect to Wi-Fi or mobile data and try again.',
    primary: { label: 'Try again', onPress: dismiss },
  },
  'offline-checkin': {
    icon: 'checkmark-circle-outline',
    title: 'Reading saved for sync',
    body: "You're offline right now. Your check-in is queued and will sync automatically when you're back online. Today still counts.",
    primary: { label: 'Got it', onPress: dismiss },
  },
  error: {
    icon: 'bug-outline',
    title: 'Something went wrong',
    body: 'Nothing you entered was lost. Just try again.',
    primary: { label: 'Try again', onPress: dismiss },
    secondary: { label: 'Go back', onPress: dismiss },
  },
  'no-results': {
    icon: 'search-outline',
    title: 'Not the right match — yet',
    body: "I don't have the right book for this yet, but I'm growing. Check back soon.",
    primary: { label: 'Go back', onPress: dismiss },
  },
  notifications: {
    icon: 'settings-outline',
    title: 'Reminders are optional',
    body: 'Tayad works without notifications. Turn them on later in Settings if you change your mind.',
    primary: { label: 'Continue without reminders', onPress: dismiss },
    secondary: { label: 'Open Settings', onPress: () => void Linking.openSettings() },
  },
};

export default function StatusScreen() {
  const { kind } = useLocalSearchParams<{ kind?: Kind }>();
  const content = CONTENT[kind ?? 'error'] ?? CONTENT.error;

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={dismiss} accessibilityLabel="Dismiss" />
      <StatusSheet {...content} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.text,
    opacity: 0.35,
  },
});
