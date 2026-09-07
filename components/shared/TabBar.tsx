import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { tokens } from '@/lib/tokens';

import { AppText } from '@/components/ui/AppText';

// The Figma bottom nav: amber-tinted surface, rounded top corners, an icon in a
// 40px hit area over a label. Active = amber (primary-pressed) + filled icon;
// inactive = dust + outline icon.
type IconName = keyof typeof Ionicons.glyphMap;

// Minimal shape of what Expo Router hands a custom `tabBar` — kept local so the
// component doesn't couple to a specific @react-navigation types version.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<
    string,
    { options: { title?: string; tabBarLabel?: unknown } }
  >;
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

const ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'home', inactive: 'home-outline' },
  progress: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  settings: { active: 'settings', inactive: 'settings-outline' },
};

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, tokens.spacing.md) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : (options.title ?? route.name);
        const icons = ICONS[route.name] ?? ICONS.index;
        const color = isFocused ? tokens.colors.primaryPressed : tokens.colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
          >
            <View style={styles.iconSlot}>
              <Ionicons
                name={isFocused ? icons.active : icons.inactive}
                size={24}
                color={color}
              />
            </View>
            <AppText variant="metadata" color={color} style={styles.label}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: tokens.spacing.lg,
    backgroundColor: tokens.colors.navSurface,
    borderTopLeftRadius: tokens.spacing.md,
    borderTopRightRadius: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  tab: {
    width: 82,
    alignItems: 'center',
    gap: tokens.spacing.xs / 2,
  },
  iconSlot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0,
    textAlign: 'center',
  },
});
