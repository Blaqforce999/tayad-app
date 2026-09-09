import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '@/lib/tokens';

import HomeActive from '@/assets/icons/nav/home-active.svg';
import HomeInactive from '@/assets/icons/nav/home-inactive.svg';
import ProgressActive from '@/assets/icons/nav/progress-active.svg';
import ProgressInactive from '@/assets/icons/nav/progress-inactive.svg';
import SettingsActive from '@/assets/icons/nav/settings-active.svg';
import SettingsInactive from '@/assets/icons/nav/settings-inactive.svg';

// Figma bottom nav (component 218:150483): white surface, a soft drop shadow,
// no rounded corners. Each tab is a 22px icon over an 11px label. Active =
// filled icon + deep-ink SemiBold label; inactive = outline icon + brown
// Regular label.
type IconPair = { active: typeof HomeActive; inactive: typeof HomeActive };

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

const ICONS: Record<string, IconPair> = {
  index: { active: HomeActive, inactive: HomeInactive },
  progress: { active: ProgressActive, inactive: ProgressInactive },
  settings: { active: SettingsActive, inactive: SettingsInactive },
};

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, tokens.spacing.md) },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : (options.title ?? route.name);
        const icons = ICONS[route.name] ?? ICONS.index;
        const Icon = isFocused ? icons.active : icons.inactive;

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
            <Icon width={22} height={22} />
            <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.surfaceRaised,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    // Figma Shadow: 0 2 6 rgba(59,47,36,0.06).
    shadowColor: tokens.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  tab: {
    width: 72,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.xs,
    overflow: 'hidden',
  },
  label: {
    fontSize: tokens.fonts.overline.size,
    lineHeight: 15,
    letterSpacing: 0,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: tokens.fonts.labelButton.family, // Manrope SemiBold
    color: tokens.colors.text,
  },
  labelInactive: {
    fontFamily: tokens.fonts.bodyLarge.family, // Manrope Regular
    color: tokens.colors.secondary,
  },
});
