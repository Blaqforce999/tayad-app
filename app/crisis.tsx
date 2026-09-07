import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/lib/tokens';

type Resource = {
  label: string;
  detail: string;
  action: string;
  url: string;
};

// Ships in the app so it works offline and instantly (.agents/rules/security.md).
const RESOURCES: Resource[] = [
  {
    label: '1. Call or text 988',
    detail: 'US Suicide & Crisis Lifeline',
    action: 'Call',
    url: 'tel:988',
  },
  {
    label: '2. Crisis Text Line',
    detail: 'Text HOME to 741741',
    action: 'Text',
    url: 'sms:741741',
  },
  {
    label: '3. Find local support',
    detail: 'Befrienders Worldwide — opens in browser',
    action: 'Open',
    url: 'https://www.befrienders.org',
  },
];

export default function CrisisScreen() {
  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={tokens.colors.text} />
          <AppText variant="labelButton">Back</AppText>
        </Pressable>

        <SectionIntro
          overline="A moment first"
          title="You deserve real support right now"
          subtitle="Tayad isn't crisis care. Please reach someone trained to help."
          titleFace="serif"
        />

        <View style={styles.resources}>
          <AppText variant="labelButton">Reach someone now</AppText>
          <View style={styles.list}>
            {RESOURCES.map((resource) => (
              <Pressable
                key={resource.url}
                style={styles.card}
                onPress={() => {
                  void Linking.openURL(resource.url);
                }}
                accessibilityRole="button"
              >
                <View style={styles.cardText}>
                  <AppText variant="labelButton">{resource.label}</AppText>
                  <AppText variant="bodySmall" color={tokens.colors.secondary}>
                    {resource.detail}
                  </AppText>
                </View>
                <AppText variant="labelButton" color={tokens.colors.primaryPressed}>
                  {resource.action}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Go back" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: tokens.spacing.base,
  },
  content: {
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
    gap: tokens.spacing.xl,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    alignSelf: 'flex-start',
  },
  resources: {
    gap: tokens.spacing.base,
  },
  list: {
    gap: tokens.spacing.sm,
  },
  card: {
    backgroundColor: tokens.colors.surfaceRaised,
    borderRadius: tokens.radii.input,
    padding: tokens.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
    ...tokens.shadows.card,
  },
  cardText: {
    flex: 1,
    gap: tokens.spacing.sm,
  },
  footer: {
    paddingVertical: tokens.spacing.sm,
  },
});
