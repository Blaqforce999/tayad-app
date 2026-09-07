import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export function SettingsRow({ icon, title, subtitle, onPress }: SettingsRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.iconWell}>
        <Ionicons name={icon} size={20} color={tokens.colors.secondary} />
      </View>
      <View style={styles.text}>
        <AppText style={styles.title}>{title}</AppText>
        {subtitle ? (
          <AppText style={styles.subtitle}>{subtitle}</AppText>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.colors.textMuted} />
    </Pressable>
  );
}

// Wraps rows in the Figma's grouped white card with hairline dividers.
export function SettingsGroup({ children }: { children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <View style={styles.group}>
      {items.map((child, index) => (
        <View key={index}>
          {index > 0 ? <View style={styles.divider} /> : null}
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: 8,
    ...tokens.shadows.card,
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: tokens.spacing.base,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  // Figma: 15px SemiBold / 13px Medium — off the fixed type scale, composed here.
  title: {
    fontFamily: tokens.fonts.labelButton.family,
    fontSize: 15,
    color: tokens.colors.text,
  },
  subtitle: {
    fontFamily: tokens.fonts.labelSmall.family,
    fontSize: tokens.fonts.labelSmall.size,
    color: tokens.colors.secondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: tokens.spacing.base,
    backgroundColor: tokens.colors.surfaceContainerHigh,
  },
});
