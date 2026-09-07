import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components/shared/TabBar';

import { useAuth } from '@/hooks/useAuth';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // The tab group is the whole authenticated app. No session -> the welcome flow.
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
