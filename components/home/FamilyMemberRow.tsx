import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FamilyMember } from '@/types/dashboardTypes';
import { useTranslation } from 'react-i18next';

type Props = {
  member: FamilyMember;
  isLast?: boolean;
  onPress?: () => void;
  isDisabled?: boolean;
};

const ROLE_COLORS: Record<string, string> = {
  owner: '#4CAF50',
  editor: '#FF9800',
  viewer: '#64B5F6',
};

const FamilyMemberRow: React.FC<Props> = ({ member, isLast, onPress, isDisabled }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const roleColor = ROLE_COLORS[member.role] ?? theme['text-hint-color'];

  return (
    <Pressable
      disabled={!onPress || isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme['background-basic-color-3'],
        },
        pressed && onPress && !isDisabled ? { opacity: 0.7 } : null,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: roleColor + '22' }]}>
        <Text style={[styles.avatarText, { color: roleColor }]}>{member.avatar}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme['text-basic-color'] }]}>{member.name}</Text>
        <Text style={[styles.email, { color: theme['text-hint-color'] }]}>{member.email}</Text>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: roleColor + '18', borderColor: roleColor }]}>
        <Text style={[styles.roleText, { color: roleColor }]}>{t(`home.role_${member.role}`)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  email: {
    fontSize: 12,
    marginTop: 1,
  },
  roleBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default FamilyMemberRow;
