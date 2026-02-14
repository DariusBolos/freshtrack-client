import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const TabLayout = () => {
  const defaultIconSize = 25;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
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
