import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';

type Props = {
  icon: string;
  label: string;
  value: string;
  color?: string;
};

const StatCard: React.FC<Props> = ({ icon, label, value, color }) => {
  const theme = useTheme();
  const accent = color ?? theme['color-primary-500'];

  return (
    <View style={[styles.card, { backgroundColor: theme['background-basic-color-2'] }]}>
      <View style={[styles.iconCircle, { backgroundColor: accent + '18' }]}>
        <FontAwesome5 name={icon} size={16} color={accent} />
      </View>
      <Text style={[styles.value, { color: theme['text-basic-color'] }]}>{value}</Text>
      <Text style={[styles.label, { color: theme['text-hint-color'] }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minWidth: 90,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default StatCard;
