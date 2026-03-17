import * as eva from '@eva-design/eva';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider, IconRegistry, useTheme } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { lightTheme, darkTheme } from '@/theme/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { SettingsProvider, useSettings } from '@/hooks/useSettings';
import { useSocket } from '@/hooks/useSocket';

const ThemedStack = () => {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme['background-basic-color-2'],
        },
        headerTintColor: theme['text-basic-color'],
        headerTitleStyle: {
          color: theme['text-basic-color'],
        },
        contentStyle: {
          backgroundColor: theme['background-basic-color-1'],
        },
      }}
    />
  );
};

const ThemedApp = () => {
  const { resolvedTheme } = useSettings();
  const evaTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  // keep socket connected while the app is mounted
  useSocket();

  return (
    <ApplicationProvider {...eva} theme={evaTheme}>
      <IconRegistry icons={EvaIconsPack} />
      <ThemedStack />
    </ApplicationProvider>
  );
};

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ThemedApp />
        </SettingsProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
