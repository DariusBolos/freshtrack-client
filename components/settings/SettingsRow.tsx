import React from 'react';
import { View, Pressable, Switch, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';

type BaseProps = {
  icon: string;
  label: string;
  isLast?: boolean;
};

type ToggleProps = BaseProps & {
  type: 'toggle';
  value: boolean;
  onValueChange: (val: boolean) => void;
};

type PressProps = BaseProps & {
  type: 'press';
  value?: string;
  onPress: () => void;
};

export type SettingsRowProps = ToggleProps | PressProps;

const SettingsRow: React.FC<SettingsRowProps> = (props) => {
  const theme = useTheme();
  const { icon, label, isLast } = props;

  const content = (
    <View
      style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme['background-basic-color-3'] }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: theme['color-primary-500'] + '18' }]}>
        <FontAwesome5 name={icon} size={14} color={theme['color-primary-500']} />
      </View>

      <Text style={[styles.label, { color: theme['text-basic-color'] }]}>{label}</Text>

      {props.type === 'toggle' ? (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{
            false: theme['background-basic-color-3'],
            true: theme['color-primary-500'] + '80',
          }}
          thumbColor={props.value ? theme['color-primary-500'] : theme['text-disabled-color']}
        />
      ) : (
        <View style={styles.pressRight}>
          {props.value !== undefined && <Text style={[styles.valueText, { color: theme['text-hint-color'] }]}>{props.value}</Text>}
          <FontAwesome5 name="chevron-right" size={12} color={theme['text-hint-color']} />
        </View>
      )}
    </View>
  );

  if (props.type === 'press') {
    return <Pressable onPress={props.onPress}>{content}</Pressable>;
  }

  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  pressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueText: {
    fontSize: 14,
  },
});

export default SettingsRow;
