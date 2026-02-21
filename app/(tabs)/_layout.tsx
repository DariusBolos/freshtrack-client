import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@ui-kitten/components';

const TabLayout = () => {
  const defaultIconSize = 25;
  const theme = useTheme();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme['color-primary-500'] }}>
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
