import * as eva from '@eva-design/eva';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { lightTheme, darkTheme } from '@/theme/themes';

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <ApplicationProvider {...eva} theme={darkTheme}>
        <IconRegistry icons={EvaIconsPack} />
        <Stack screenOptions={{ headerShown: false }} />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
