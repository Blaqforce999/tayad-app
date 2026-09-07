import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  style?: ViewStyle;
};

// Design system leans on copy over graphics; the single muted icon in a circle
// is the one concession, matching the Figma.
export function EmptyState({ icon = 'book-outline', title, body, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={tokens.colors.secondary} />
      </View>
      <View style={styles.copy}>
        <AppText variant="landingBody" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="bodySmall" color={tokens.colors.secondary} style={styles.body}>
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surfaceContainer,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
});
