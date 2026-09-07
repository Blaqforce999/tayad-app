import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { tokens } from '@/lib/tokens';

type ScreenProps = {
  children: ReactNode;
  // Which safe-area edges to inset. Screens under the tab bar usually drop 'bottom'.
  edges?: readonly Edge[];
  style?: ViewStyle;
};

export function Screen({ children, edges = ['top', 'bottom'], style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
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
    paddingHorizontal: tokens.spacing.lg,
  },
});
