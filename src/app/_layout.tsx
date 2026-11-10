import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DrawerProvider } from '@/components/drawer';
import { AppProvider } from '@/lib/app-store';
import { ThemeProvider, useTheme } from '@/lib/theme';

function ThemedStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: 'New study task', presentation: 'modal' }} />
      <Stack.Screen name="subjects" options={{ title: 'Manage subjects' }} />
      <Stack.Screen name="goals" options={{ title: 'Goals' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <DrawerProvider>
            <StatusBar style="auto" />
            <ThemedStack />
          </DrawerProvider>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
