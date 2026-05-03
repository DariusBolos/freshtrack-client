import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

const TabLayout = () => {
  const defaultIconSize = 25;
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme['color-primary-500'],
        tabBarInactiveTintColor: theme['text-hint-color'],
        tabBarStyle: {
          backgroundColor: theme['background-basic-color-2'],
          borderTopColor: theme['background-basic-color-3'],
        },
        headerStyle: {
          backgroundColor: theme['background-basic-color-2'],
        },
        headerTintColor: theme['text-basic-color'],
        headerTitleStyle: {
          color: theme['text-basic-color'],
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={defaultIconSize} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('tabs.scan'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={defaultIconSize} name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: t('tabs.inventory'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={defaultIconSize} name="pizza-slice" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={defaultIconSize} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
