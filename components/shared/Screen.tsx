import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { tokens } from '@/lib/tokens';

type ScreenProps = {
  children: ReactNode;
  // Which safe-area edges to inset. Screens under the tab bar usually drop 'bottom'.
  edges?: readonly Edge[];
  // Page background. Defaults to the app surface; pass a token when the Figma
  // screen sits on a different surface (e.g. surface-container for auth).
  backgroundColor?: string;
  style?: ViewStyle;
};

export function Screen({
  children,
  edges = ['top', 'bottom'],
  backgroundColor,
  style,
}: ScreenProps) {
  return (
    <SafeAreaView
      style={[styles.safe, backgroundColor ? { backgroundColor } : null]}
      edges={edges}
    >
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  content: {
    flex: 1,
    // Figma screens use a 16px screen margin.
    paddingHorizontal: tokens.spacing.base,
  },
});
