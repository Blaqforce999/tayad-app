import { useEffect } from 'react';
import { LogBox, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// React Native has no WebCrypto `subtle` API, so Supabase's PKCE helper warns
// once and falls back to a plain code challenge. Email/password sign-in does not
// rely on it, so the warning is noise — hide the LogBox popup it triggers.
LogBox.ignoreLogs(['WebCrypto API is not supported']);

import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { AuthProvider } from '@/contexts/AuthContext';
import { PlanProvider } from '@/contexts/PlanContext';
import { StreakProvider } from '@/contexts/StreakContext';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '@/lib/tokens';

// Hold the native splash until fonts and the first auth check are both ready.
void SplashScreen.preventAutoHideAsync();

// Expo Router renders this in place of any route that throws. Never show the raw
// error to the user (.agents/rules/architecture.md); Expo already logs it in dev.
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Screen>
      <View style={styles.fallback}>
        <AppText variant="displayMedium">Something went wrong</AppText>
        <AppText variant="bodyLarge" color={tokens.colors.textMuted} style={styles.fallbackBody}>
          That is on us, not you. Give it another try.
        </AppText>
        <Button label="Try again" onPress={retry} />
      </View>
    </Screen>
  );
}

function RootStack() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: styles.stackContent }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="problem" />
      <Stack.Screen name="clarifying" />
      <Stack.Screen name="recommendation" />
      <Stack.Screen
        name="status"
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="plan-setup" />
      <Stack.Screen name="update-pages" />
      <Stack.Screen name="daily-goal" />
      <Stack.Screen name="reflection" />
      <Stack.Screen name="completion" />
      <Stack.Screen name="reading-history" />
      <Stack.Screen name="reflection-journal" />
      <Stack.Screen name="settings-reminder" />
      <Stack.Screen name="settings-account" />
      <Stack.Screen name="settings-privacy" />
      <Stack.Screen name="settings-delete" options={{ presentation: 'modal' }} />
      <Stack.Screen name="crisis" />
    </Stack>
  );
}

export default function RootLayout() {
  // Family names must match the `family` values in lib/tokens.ts exactly.
  const [fontsLoaded, fontError] = useFonts({
    'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
    'Manrope-Regular': require('../assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium': require('../assets/fonts/Manrope-Medium.ttf'),
    'Manrope-SemiBold': require('../assets/fonts/Manrope-SemiBold.ttf'),
  });

  // On a font error, carry on with the system fallback rather than blocking the app.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <PlanProvider>
            <StreakProvider>
              <StatusBar style="dark" />
              <RootStack />
            </StreakProvider>
          </PlanProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stackContent: {
    backgroundColor: tokens.colors.surface,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    gap: tokens.spacing.base,
  },
  fallbackBody: {
    marginBottom: tokens.spacing.sm,
  },
});
