import * as eva from '@eva-design/eva';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { lightTheme, darkTheme } from '@/theme/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ApplicationProvider {...eva} theme={darkTheme}>
          <IconRegistry icons={EvaIconsPack} />
          <Stack screenOptions={{ headerShown: false }} />
        </ApplicationProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
