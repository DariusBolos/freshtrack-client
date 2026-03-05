import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@ui-kitten/components';

const TabLayout = () => {
  const defaultIconSize = 25;
  const theme = useTheme();

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
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 size={defaultIconSize} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <FontAwesome5 size={defaultIconSize} name="pizza-slice" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome5 size={defaultIconSize} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
