import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';

type Action = { label: string; onPress: () => void };

type StatusSheetProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  primary?: Action;
  secondary?: Action;
};

// The shared bottom-sheet used by every edge/system state (offline, error,
// no results, notifications). Rounded top, drag handle, icon, copy, actions.
export function StatusSheet({ icon, title, body, primary, secondary }: StatusSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sheet, { paddingBottom: tokens.spacing.lg + insets.bottom }]}>
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconWell}>
          <Ionicons name={icon} size={24} color={tokens.colors.secondary} />
        </View>

        <View style={styles.copy}>
          <AppText variant="landingBody">{title}</AppText>
          <AppText variant="bodySmall" color={tokens.colors.secondary}>
            {body}
          </AppText>
        </View>
      </View>

      {primary || secondary ? (
        <View style={styles.actions}>
          {primary ? <Button label={primary.label} onPress={primary.onPress} /> : null}
          {secondary ? (
            <Button label={secondary.label} variant="ghost" onPress={secondary.onPress} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderTopLeftRadius: tokens.radii.card,
    borderTopRightRadius: tokens.radii.card,
    paddingTop: tokens.spacing.base,
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.base,
    // Upward lift so it reads as a layer above the content it covers.
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  handleRow: {
    alignItems: 'center',
  },
  // Figma: 40x4, secondary.
  handle: {
    width: 40,
    height: 4,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.secondary,
  },
  // Figma: icon-well + copy grouped at gap 12.
  body: {
    gap: tokens.spacing.md,
  },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: tokens.spacing.xs,
  },
  actions: {
    gap: tokens.spacing.sm,
  },
});
