import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Screen } from '@/components/shared/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/lib/tokens';

type Resource = {
  label: string;
  detail: string;
  action?: string;
  url: string;
};

// Ships in the app so it works offline and instantly (.agents/rules/security.md).
const RESOURCES: Resource[] = [
  {
    label: '1. Call 988',
    detail: 'Suicide & Crisis Lifeline',
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
    detail: 'Opens in browser',
    url: 'https://www.befrienders.org',
  },
];

export default function CrisisScreen() {
  return (
    <Screen style={styles.screen} backgroundColor={tokens.colors.surfaceContainer}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="arrow-left" size={24} color={tokens.colors.text} />
            <AppText variant="labelButton">Back</AppText>
          </Pressable>

          <AppText variant="overline" color={tokens.colors.secondary}>
            A moment first
          </AppText>

          <View style={styles.heroCopy}>
            <AppText variant="displayLarge">You deserve real support right now</AppText>
            <AppText variant="bodySmall" color={tokens.colors.secondary}>
              Tayad isn&apos;t crisis care. Please reach someone trained to help.
            </AppText>
          </View>
        </View>

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
                accessibilityLabel={`${resource.label}. ${resource.detail}`}
              >
                <View style={styles.cardText}>
                  <AppText variant="labelButton">{resource.label}</AppText>
                  <AppText variant="bodySmall" color={tokens.colors.secondary}>
                    {resource.detail}
                  </AppText>
                </View>
                {resource.action ? (
                  <AppText variant="labelButton" color={tokens.colors.primaryPressed}>
                    {resource.action}
                  </AppText>
                ) : (
                  <Feather name="arrow-right" size={24} color={tokens.colors.text} />
                )}
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
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.xl,
  },
  header: {
    gap: tokens.spacing.base,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    alignSelf: 'flex-start',
  },
  heroCopy: {
    gap: tokens.spacing.sm,
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
    paddingVertical: tokens.spacing.base,
  },
});
