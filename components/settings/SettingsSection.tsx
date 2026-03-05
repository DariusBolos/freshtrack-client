import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';

type Props = {
  title: string;
  children: React.ReactNode;
};

const SettingsSection: React.FC<Props> = ({ title, children }) => {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: theme['color-primary-500'] }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: theme['background-basic-color-2'] }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
});

export default SettingsSection;
